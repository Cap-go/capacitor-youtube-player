import Foundation
import Capacitor
import WebKit
import YoutubeKit
import UIKit

/**
 * YouTube Player Plugin for Capacitor
 * Uses YoutubeKit for native iOS playback in fullscreen mode
 */
@objc(YoutubePlayerPlugin)
public class YoutubePlayerPlugin: CAPPlugin, CAPBridgedPlugin {
    private let PLUGIN_VERSION: String = "7.1.5"
    public let identifier = "YoutubePlayerPlugin"
    public let jsName = "YoutubePlayer"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise)
    ]

    private var youtubePlayers: [String: YTSwiftyPlayer] = [:]

    @objc func getPluginVersion(_ call: CAPPluginCall) {
        call.resolve(["version": self.PLUGIN_VERSION])
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

            // Create YoutubeKit player
            let player = YTSwiftyPlayer(
                frame: CGRect(x: 0, y: 0, width: 640, height: 480),
                playerVars: self.getPlayerVars(from: call)
            )

            // Store the player
            self.youtubePlayers[playerId] = player

            // Create a fullscreen view controller
            let playerViewController = UIViewController()
            playerViewController.view.backgroundColor = .black
            playerViewController.modalPresentationStyle = .fullScreen

            // Add player to view controller
            player.frame = playerViewController.view.bounds
            player.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            playerViewController.view.addSubview(player)

            // Load video
            player.loadWithVideoId(videoId)

            // Get autoplay setting
            let autoplay = call.getBool("autoplay") ?? false
            if autoplay {
                player.playVideo()
            }

            // Present fullscreen
            self.bridge?.viewController?.present(playerViewController, animated: true) {
                call.resolve([
                    "playerReady": true,
                    "player": playerId
                ])
            }
        }
    }

    private func getPlayerVars(from call: CAPPluginCall) -> [String: Any] {
        var playerVars: [String: Any] = [
            "playsinline": 0,  // Force fullscreen
            "controls": 1,      // Show controls
            "showinfo": 0,      // Hide video info
            "rel": 0,           // Don't show related videos
            "modestbranding": 1 // Hide YouTube logo
        ]

        // Merge with user-provided playerVars
        if let userPlayerVars = call.getObject("playerVars") {
            for (key, value) in userPlayerVars {
                playerVars[key] = value
            }
        }

        return playerVars
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
