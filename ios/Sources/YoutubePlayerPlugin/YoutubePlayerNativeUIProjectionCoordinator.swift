import Capacitor
import UIKit
import WebViewNativeUIEngine

final class YoutubePlayerNativeUIProjectionCoordinator {
    private weak var plugin: CAPPlugin?
    private var projections: [String: NativeUIProjection] = [:]
    private var enabledPlayerIds: Set<String> = []

    init(plugin: CAPPlugin) {
        self.plugin = plugin
    }

    var hasActiveRegistrations: Bool {
        !projections.isEmpty
    }

    func isEnabled(forPlayerId playerId: String) -> Bool {
        enabledPlayerIds.contains(playerId)
    }

    func register(playerId: String, projectionSelector: String, viewProvider: @escaping () -> UIView?) throws {
        close(playerId: playerId)
        guard let webView = plugin?.bridge?.webView else {
            throw NSError(domain: "YoutubePlayer", code: 1, userInfo: [NSLocalizedDescriptionKey: "WebView unavailable"])
        }
        let listeners = NativeUIProjection.ReceiveListeners(
            update: ["playerFrameChanged"],
            projection: .init(
                native: ["inlinePlayerShown"],
                web: ["webOverlayBegan"],
                none: ["inlinePlayerHidden"]
            ),
            match: ["playerId": playerId]
        )
        let projection = try NativeUIProjection(
            webView: webView,
            plugin: "YoutubePlayer",
            projectionSelector: projectionSelector,
            receiveListeners: listeners,
            failedFallback: .web,
            canCapture: { true },
            view: viewProvider
        )
        enabledPlayerIds.insert(playerId)
        projections[playerId] = projection
    }

    func close(playerId: String) {
        enabledPlayerIds.remove(playerId)
        projections.removeValue(forKey: playerId)?.destroy()
    }

    func closeAll() {
        for playerId in Array(projections.keys) {
            close(playerId: playerId)
        }
    }

    func receive(eventName: String, data: [String: Any]?) {
        guard !projections.isEmpty else {
            return
        }
        for projection in projections.values {
            projection.receive(eventName, data: data)
        }
    }
}

enum YoutubePlayerNativeUIProjectionOptions {
    static func isEnabled(_ call: CAPPluginCall) -> Bool {
        call.getBool("nativeUIProjection") ?? false
    }

    static func resolveSelector(_ call: CAPPluginCall, playerId: String) throws -> String? {
        guard isEnabled(call) else {
            return nil
        }
        if let selector = call.getString("projectionSelector")?.trimmingCharacters(in: .whitespacesAndNewlines), !selector.isEmpty {
            return selector
        }
        let elementId = call.getString("elementId")?.trimmingCharacters(in: .whitespacesAndNewlines)
        let id = (elementId?.isEmpty == false ? elementId : playerId) ?? ""
        if id.isEmpty {
            throw NSError(
                domain: "YoutubePlayer",
                code: 2,
                userInfo: [NSLocalizedDescriptionKey: "projectionSelector is required when nativeUIProjection is enabled"]
            )
        }
        return domIdSelector(id)
    }

    private static func domIdSelector(_ id: String) -> String {
        let escaped = id
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
        return "[id=\"\(escaped)\"]"
    }
}