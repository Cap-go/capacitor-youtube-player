import Foundation
import Capacitor
import WebKit
import UIKit

/**
 * YouTube Player Plugin for Capacitor
 * Uses native WKWebView for fullscreen-only iOS playback
 */
@objc(YoutubePlayerPlugin)
public class YoutubePlayerPlugin: CAPPlugin, CAPBridgedPlugin {
    private let pluginVersion: String = "7.3.2"
    public let identifier = "YoutubePlayerPlugin"
    public let jsName = "YoutubePlayer"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise)
    ]

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve(["value": value])
    }

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.pluginVersion])
    }

    @objc func initialize(_ call: CAPPluginCall) {
        guard let videoId = call.getString("videoId"),
              let playerId = call.getString("playerId") else {
            call.reject("Missing required parameters: videoId and playerId")
            return
        }

        // Set cookies if provided
        if let cookies = call.getString("cookies") {
            setCookies(cookies) { [weak self] success in
                if !success {
                    print("Warning: Failed to set some cookies")
                }
                self?.createPlayer(call: call, playerId: playerId, videoId: videoId)
            }
        } else {
            createPlayer(call: call, playerId: playerId, videoId: videoId)
        }
    }

    private func createPlayer(call: CAPPluginCall, playerId: String, videoId: String) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            // Build player vars
            var playerVars: [String: Any] = [
                "playsinline": 0,  // Force fullscreen
                "controls": 1,
                "showinfo": 0,
                "rel": 0,
                "modestbranding": 1
            ]

            // Merge user-provided playerVars
            if let userPlayerVars = call.getObject("playerVars") {
                for (key, value) in userPlayerVars {
                    playerVars[key] = value
                }
            }

            let autoplay = call.getBool("autoplay") ?? false
            playerVars["autoplay"] = autoplay ? 1 : 0

            // Convert playerVars to JSON string
            let playerVarsJSON = (try? JSONSerialization.data(withJSONObject: playerVars))
                .flatMap { String(data: $0, encoding: .utf8) } ?? "{}"

            // Create WKWebView configuration
            let configuration = WKWebViewConfiguration()
            configuration.allowsInlineMediaPlayback = false
            configuration.mediaTypesRequiringUserActionForPlayback = []

            // Create WKWebView
            let webView = WKWebView(frame: .zero, configuration: configuration)
            webView.scrollView.isScrollEnabled = false
            webView.backgroundColor = .black

            // Create fullscreen view controller
            let playerViewController = UIViewController()
            playerViewController.view = webView
            playerViewController.modalPresentationStyle = .fullScreen

            // Load HTML with video
            let htmlString = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        background-color: #000;
                    }
                    #player {
                        width: 100%;
                        height: 100%;
                    }
                </style>
            </head>
            <body>
                <div id="player"></div>
                <script src="https://www.youtube.com/iframe_api"></script>
                <script>
                    var player;
                    function onYouTubeIframeAPIReady() {
                        player = new YT.Player('player', {
                            videoId: '\(videoId)',
                            playerVars: \(playerVarsJSON),
                            events: {
                                'onReady': onPlayerReady
                            }
                        });
                    }
                    function onPlayerReady(event) {
                        console.log('Player ready');
                    }
                </script>
            </body>
            </html>
            """

            webView.loadHTMLString(htmlString, baseURL: URL(string: "https://www.youtube.com"))

            // Present fullscreen
            self.bridge?.viewController?.present(playerViewController, animated: true) {
                call.resolve([
                    "playerReady": true,
                    "player": playerId
                ])
            }
        }
    }

    private func setCookies(_ cookieString: String, completion: @escaping (Bool) -> Void) {
        guard let webView = self.bridge?.webView else {
            completion(false)
            return
        }

        let cookieStore = webView.configuration.websiteDataStore.httpCookieStore
        let cookiePairs = cookieString.components(separatedBy: ";").map { $0.trimmingCharacters(in: .whitespaces) }

        var cookiesSet = 0
        let totalCookies = cookiePairs.filter { !$0.isEmpty }.count

        guard totalCookies > 0 else {
            completion(true)
            return
        }

        for pair in cookiePairs {
            guard !pair.isEmpty else { continue }

            let parts = pair.components(separatedBy: "=")
            guard parts.count == 2 else { continue }

            let name = parts[0].trimmingCharacters(in: .whitespaces)
            let value = parts[1].trimmingCharacters(in: .whitespaces)

            let properties: [HTTPCookiePropertyKey: Any] = [
                .name: name,
                .value: value,
                .domain: ".youtube.com",
                .path: "/",
                .secure: "TRUE"
            ]

            if let cookie = HTTPCookie(properties: properties) {
                cookieStore.setCookie(cookie) {
                    cookiesSet += 1
                    if cookiesSet == totalCookies {
                        completion(true)
                    }
                }
            } else {
                cookiesSet += 1
                if cookiesSet == totalCookies {
                    completion(totalCookies > 0)
                }
            }
        }
    }
}
