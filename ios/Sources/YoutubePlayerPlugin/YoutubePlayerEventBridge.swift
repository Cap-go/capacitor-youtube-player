import Foundation
import WebKit

final class YoutubePlayerEventBridge: NSObject, WKScriptMessageHandler {
    private weak var plugin: YoutubePlayerPlugin?
    let playerId: String

    init(plugin: YoutubePlayerPlugin, playerId: String) {
        self.plugin = plugin
        self.playerId = playerId
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == YoutubePlayerPlugin.eventHandlerName,
              let body = message.body as? [String: Any],
              let type = body["type"] as? String else {
            return
        }

        plugin?.handlePlayerEvent(playerId: playerId, type: type, body: body)
    }
}
