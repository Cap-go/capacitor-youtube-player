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
    private let pluginVersion: String = "8.1.11"
    public let identifier = "YoutubePlayerPlugin"
    public let jsName = "YoutubePlayer"
    
    // Store player instances by playerId
    private var players: [String: PlayerInstance] = [:]
    
    // Structure to hold player information
    private struct PlayerInstance {
        let webView: WKWebView
        let viewController: UIViewController
    }
    
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPluginVersion", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "destroy", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "playVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pauseVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "seekTo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadVideoById", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cueVideoById", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadVideoByUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cueVideoByUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "mute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unMute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isMuted", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVolume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setSize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPlaybackRate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPlaybackRate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAvailablePlaybackRates", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setLoop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setShuffle", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVideoLoadedFraction", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPlayerState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentTime", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getDuration", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVideoUrl", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getVideoEmbedCode", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPlaylist", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPlaylistIndex", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cuePlaylist", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadPlaylist", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "nextVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "previousVideo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "playVideoAt", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "toggleFullScreen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPlaybackQuality", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setPlaybackQuality", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAvailableQualityLevels", returnType: CAPPluginReturnPromise)
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
            let escapedVideoId = escapeJavaScript(videoId)
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
                    window.playerReady = false;
                    
                    function onYouTubeIframeAPIReady() {
                        player = new YT.Player('player', {
                            videoId: '\(escapedVideoId)',
                            playerVars: \(playerVarsJSON),
                            events: {
                                'onReady': onPlayerReady
                            }
                        });
                    }
                    
                    function onPlayerReady(event) {
                        console.log('Player ready');
                        window.playerReady = true;
                    }
                    
                    // Helper function to execute player commands
                    function executePlayerCommand(command, ...args) {
                        try {
                            if (!window.playerReady || !player) {
                                return { success: false, error: 'Player not ready' };
                            }
                            const result = player[command](...args);
                            return { success: true, value: result };
                        } catch (error) {
                            return { success: false, error: error.message };
                        }
                    }
                </script>
            </body>
            </html>
            """

            webView.loadHTMLString(htmlString, baseURL: URL(string: "https://www.youtube.com"))

            // Store player instance
            let playerInstance = PlayerInstance(webView: webView, viewController: playerViewController)
            self.players[playerId] = playerInstance

            // Present fullscreen
            self.bridge?.viewController?.present(playerViewController, animated: true) {
                call.resolve([
                    "playerReady": true,
                    "player": playerId
                ])
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func escapeJavaScript(_ string: String) -> String {
        return string
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "'", with: "\\'")
            .replacingOccurrences(of: "\"", with: "\\\"")
            .replacingOccurrences(of: "\n", with: "\\n")
            .replacingOccurrences(of: "\r", with: "\\r")
            .replacingOccurrences(of: "\t", with: "\\t")
            .replacingOccurrences(of: "\u{08}", with: "\\b")  // backspace
            .replacingOccurrences(of: "\u{0C}", with: "\\f")  // form feed
            .replacingOccurrences(of: "\u{00}", with: "\\0")  // null
    }
    
    private func executePlayerCommandWithOptions(_ call: CAPPluginCall, playerId: String, command: String, optionsKey: String, includeOptionsInResult: Bool = true) {
        guard let options = call.getObject(optionsKey) else {
            call.reject("Missing \(optionsKey) parameter")
            return
        }
        
        guard let optionsData = try? JSONSerialization.data(withJSONObject: options),
              let optionsJSON = String(data: optionsData, encoding: .utf8) else {
            call.reject("Failed to serialize options")
            return
        }
        
        // Escape command name (internal string, but being defensive)
        let escapedCommand = escapeJavaScript(command)
        
        // optionsJSON is safe: it's produced by JSONSerialization which ensures valid JSON/JavaScript syntax
        executeJavaScript(playerId, script: "executePlayerCommand('\(escapedCommand)', \(optionsJSON))") { result in
            switch result {
            case .success:
                var resultDict: [String: Any] = [
                    "method": command,
                    "value": true
                ]
                if includeOptionsInResult {
                    resultDict["options"] = options
                }
                call.resolve([
                    "result": resultDict
                ])
            case .failure(let error):
                call.reject("Failed to execute \(command): \(error.localizedDescription)")
            }
        }
    }
    
    private func executeJavaScript(_ playerId: String, script: String, completion: @escaping (Result<Any?, Error>) -> Void) {
        guard let playerInstance = players[playerId] else {
            completion(.failure(NSError(domain: "YoutubePlayer", code: -1, userInfo: [NSLocalizedDescriptionKey: "Player not found"])))
            return
        }
        
        playerInstance.webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                completion(.failure(error))
            } else {
                completion(.success(result))
            }
        }
    }
    
    // MARK: - Plugin Methods
    
    @objc func destroy(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let playerInstance = self.players[playerId] else {
                call.reject("Player not found")
                return
            }
            
            playerInstance.viewController.dismiss(animated: true) {
                self.players.removeValue(forKey: playerId)
                call.resolve([
                    "result": [
                        "method": "destroy",
                        "value": true
                    ]
                ])
            }
        }
    }
    
    @objc func playVideo(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('playVideo')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "playVideo",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to play video: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func pauseVideo(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('pauseVideo')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "pauseVideo",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to pause video: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func stopVideo(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('stopVideo')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "stopVideo",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to stop video: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func seekTo(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let seconds = call.getDouble("seconds") ?? 0
        let allowSeekAhead = call.getBool("allowSeekAhead") ?? true
        
        // Numeric and boolean values don't need escaping - they're safe to interpolate directly
        executeJavaScript(playerId, script: "executePlayerCommand('seekTo', \(seconds), \(allowSeekAhead))") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "seekTo",
                        "value": true,
                        "seconds": seconds,
                        "allowSeekAhead": allowSeekAhead
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to seek: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func loadVideoById(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executePlayerCommandWithOptions(call, playerId: playerId, command: "loadVideoById", optionsKey: "options")
    }
    
    @objc func cueVideoById(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executePlayerCommandWithOptions(call, playerId: playerId, command: "cueVideoById", optionsKey: "options")
    }
    
    @objc func loadVideoByUrl(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executePlayerCommandWithOptions(call, playerId: playerId, command: "loadVideoByUrl", optionsKey: "options")
    }
    
    @objc func cueVideoByUrl(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executePlayerCommandWithOptions(call, playerId: playerId, command: "cueVideoByUrl", optionsKey: "options")
    }
    
    @objc func mute(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('mute')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "mute",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to mute: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func unMute(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('unMute')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "unMute",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to unmute: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func isMuted(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('isMuted')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let isMuted = resultDict?["value"] as? Bool ?? false
                call.resolve([
                    "result": [
                        "method": "isMuted",
                        "value": isMuted
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get mute status: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func setVolume(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let volume = call.getInt("volume") ?? 50
        
        executeJavaScript(playerId, script: "executePlayerCommand('setVolume', \(volume))") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "setVolume",
                        "value": volume
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to set volume: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getVolume(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getVolume')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let volume = resultDict?["value"] as? Int ?? 50
                call.resolve([
                    "result": [
                        "method": "getVolume",
                        "value": volume
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get volume: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func setSize(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let width = call.getInt("width") ?? 640
        let height = call.getInt("height") ?? 360
        
        // iOS always uses fullscreen, but we acknowledge the call
        call.resolve([
            "result": [
                "method": "setSize",
                "value": [
                    "width": width,
                    "height": height
                ]
            ]
        ])
    }
    
    @objc func getPlaybackRate(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getPlaybackRate')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let rate = resultDict?["value"] as? Double ?? 1.0
                call.resolve([
                    "result": [
                        "method": "getPlaybackRate",
                        "value": rate
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get playback rate: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func setPlaybackRate(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let rate = call.getDouble("suggestedRate") ?? 1.0
        
        executeJavaScript(playerId, script: "executePlayerCommand('setPlaybackRate', \(rate))") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "setPlaybackRate",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to set playback rate: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getAvailablePlaybackRates(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getAvailablePlaybackRates')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let rates = resultDict?["value"] as? [Double] ?? [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
                call.resolve([
                    "result": [
                        "method": "getAvailablePlaybackRates",
                        "value": rates
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get available playback rates: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func setLoop(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let loop = call.getBool("loopPlaylists") ?? false
        
        executeJavaScript(playerId, script: "executePlayerCommand('setLoop', \(loop))") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "setLoop",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to set loop: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func setShuffle(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let shuffle = call.getBool("shufflePlaylist") ?? false
        
        executeJavaScript(playerId, script: "executePlayerCommand('setShuffle', \(shuffle))") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "setShuffle",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to set shuffle: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getVideoLoadedFraction(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getVideoLoadedFraction')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let fraction = resultDict?["value"] as? Double ?? 0.0
                call.resolve([
                    "result": [
                        "method": "getVideoLoadedFraction",
                        "value": fraction
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get video loaded fraction: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getPlayerState(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getPlayerState')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let state = resultDict?["value"] as? Int ?? -1
                call.resolve([
                    "result": [
                        "method": "getPlayerState",
                        "value": state
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get player state: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getCurrentTime(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getCurrentTime')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let time = resultDict?["value"] as? Double ?? 0.0
                call.resolve([
                    "result": [
                        "method": "getCurrentTime",
                        "value": time
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get current time: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getDuration(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getDuration')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let duration = resultDict?["value"] as? Double ?? 0.0
                call.resolve([
                    "result": [
                        "method": "getDuration",
                        "value": duration
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get duration: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getVideoUrl(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getVideoUrl')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let url = resultDict?["value"] as? String ?? ""
                call.resolve([
                    "result": [
                        "method": "getVideoUrl",
                        "value": url
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get video URL: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getVideoEmbedCode(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getVideoEmbedCode')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let embedCode = resultDict?["value"] as? String ?? ""
                call.resolve([
                    "result": [
                        "method": "getVideoEmbedCode",
                        "value": embedCode
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get video embed code: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getPlaylist(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getPlaylist')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let playlist = resultDict?["value"] as? [String] ?? []
                call.resolve([
                    "result": [
                        "method": "getPlaylist",
                        "value": playlist
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get playlist: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getPlaylistIndex(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getPlaylistIndex')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let index = resultDict?["value"] as? Int ?? 0
                call.resolve([
                    "result": [
                        "method": "getPlaylistIndex",
                        "value": index
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get playlist index: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func cuePlaylist(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executePlayerCommandWithOptions(call, playerId: playerId, command: "cuePlaylist", optionsKey: "playlistOptions", includeOptionsInResult: false)
    }
    
    @objc func loadPlaylist(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executePlayerCommandWithOptions(call, playerId: playerId, command: "loadPlaylist", optionsKey: "playlistOptions", includeOptionsInResult: false)
    }
    
    @objc func nextVideo(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('nextVideo')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "nextVideo",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to play next video: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func previousVideo(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('previousVideo')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "previousVideo",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to play previous video: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func playVideoAt(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let index = call.getInt("index") ?? 0
        
        executeJavaScript(playerId, script: "executePlayerCommand('playVideoAt', \(index))") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "playVideoAt",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to play video at index: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func toggleFullScreen(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        let isFullScreen = call.getBool("isFullScreen")
        
        // iOS is always fullscreen with this implementation
        call.resolve([
            "result": [
                "method": "toggleFullScreen",
                "value": isFullScreen ?? true
            ]
        ])
    }
    
    @objc func getPlaybackQuality(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getPlaybackQuality')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let quality = resultDict?["value"] as? String ?? "default"
                call.resolve([
                    "result": [
                        "method": "getPlaybackQuality",
                        "value": quality
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get playback quality: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func setPlaybackQuality(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        guard let quality = call.getString("suggestedQuality") else {
            call.reject("Missing suggestedQuality parameter")
            return
        }
        
        let escapedQuality = escapeJavaScript(quality)
        
        executeJavaScript(playerId, script: "executePlayerCommand('setPlaybackQuality', '\(escapedQuality)')") { result in
            switch result {
            case .success:
                call.resolve([
                    "result": [
                        "method": "setPlaybackQuality",
                        "value": true
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to set playback quality: \(error.localizedDescription)")
            }
        }
    }
    
    @objc func getAvailableQualityLevels(_ call: CAPPluginCall) {
        guard let playerId = call.getString("playerId") else {
            call.reject("Missing playerId parameter")
            return
        }
        
        executeJavaScript(playerId, script: "executePlayerCommand('getAvailableQualityLevels')") { result in
            switch result {
            case .success(let value):
                let resultDict = value as? [String: Any]
                let levels = resultDict?["value"] as? [String] ?? ["default"]
                call.resolve([
                    "result": [
                        "method": "getAvailableQualityLevels",
                        "value": levels
                    ]
                ])
            case .failure(let error):
                call.reject("Failed to get available quality levels: \(error.localizedDescription)")
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
