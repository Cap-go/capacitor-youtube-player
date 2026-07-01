import Foundation
import WebKit

final class YoutubePlayerRefererURLSchemeHandler: NSObject, WKURLSchemeHandler {
    static let scheme = "capgo-youtube"
    static let defaultReferer = "https://www.youtube.com"

    private let referer: String
    private let playerHTML: String
    private var activeTasks: [ObjectIdentifier: URLSessionDataTask] = [:]
    private let lock = NSLock()

    init(referer: String, playerHTML: String) {
        self.referer = referer
        self.playerHTML = playerHTML
        super.init()
    }

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestURL = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(Self.missingURLError())
            return
        }

        if Self.isPlayerPage(requestURL) {
            servePlayerHTML(to: urlSchemeTask, requestURL: requestURL)
            return
        }

        guard let httpsURL = Self.httpsURL(from: requestURL) else {
            urlSchemeTask.didFailWithError(Self.invalidProxyURLError(requestURL))
            return
        }

        var request = URLRequest(url: httpsURL)
        if request.value(forHTTPHeaderField: "Referer") == nil {
            request.setValue(referer, forHTTPHeaderField: "Referer")
        }

        let task = URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                guard let self else { return }

                self.lock.lock()
                self.activeTasks.removeValue(forKey: ObjectIdentifier(urlSchemeTask))
                self.lock.unlock()

                if let error = error {
                    urlSchemeTask.didFailWithError(error)
                    return
                }

                guard let response = response else {
                    urlSchemeTask.didFailWithError(Self.emptyResponseError())
                    return
                }

                urlSchemeTask.didReceive(response)

                if let data = data {
                    urlSchemeTask.didReceive(data)
                }

                urlSchemeTask.didFinish()
            }
        }

        lock.lock()
        activeTasks[ObjectIdentifier(urlSchemeTask)] = task
        lock.unlock()
        task.resume()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        lock.lock()
        let task = activeTasks.removeValue(forKey: ObjectIdentifier(urlSchemeTask))
        lock.unlock()
        task?.cancel()
    }

    static func playerPageURL() -> URL {
        URL(string: "\(scheme)://www.youtube.com/player")!
    }

    static func httpsURL(from url: URL) -> URL? {
        guard url.scheme == scheme else {
            return nil
        }

        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            return nil
        }

        components.scheme = "https"
        if components.port == 443 {
            components.port = nil
        }
        if components.path.isEmpty {
            components.path = "/"
        }
        return components.url
    }

    static func isValidReferer(_ referer: String?) -> Bool {
        guard
            let referer,
            let url = URL(string: referer),
            let host = url.host,
            !host.isEmpty,
            let scheme = url.scheme?.lowercased(),
            scheme == "http" || scheme == "https"
        else {
            return false
        }

        return true
    }

    private static func isPlayerPage(_ url: URL) -> Bool {
        guard url.scheme == scheme, url.host == "www.youtube.com" else {
            return false
        }

        let path = url.path
        return path == "/player" || path == "/player/"
    }

    private func servePlayerHTML(to urlSchemeTask: WKURLSchemeTask, requestURL: URL) {
        let data = Data(playerHTML.utf8)
        let headers = ["Content-Type": "text/html; charset=utf-8"]
        let response = HTTPURLResponse(
            url: requestURL,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: headers
        )

        guard let response else {
            urlSchemeTask.didFailWithError(Self.emptyResponseError())
            return
        }

        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    private static func missingURLError() -> NSError {
        NSError(domain: "YoutubePlayer", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing request URL"])
    }

    private static func invalidProxyURLError(_ url: URL) -> NSError {
        NSError(
            domain: "YoutubePlayer",
            code: 2,
            userInfo: [NSLocalizedDescriptionKey: "Unable to proxy URL: \(url.absoluteString)"]
        )
    }

    private static func emptyResponseError() -> NSError {
        NSError(domain: "YoutubePlayer", code: 3, userInfo: [NSLocalizedDescriptionKey: "Empty response from proxied request"])
    }
}
