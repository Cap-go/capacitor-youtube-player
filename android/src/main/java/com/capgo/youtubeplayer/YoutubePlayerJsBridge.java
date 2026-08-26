package com.capgo.youtubeplayer;

import android.webkit.JavascriptInterface;
import com.getcapacitor.Plugin;

public class YoutubePlayerJsBridge {

    public interface EventEmitter {
        void emitPlayerEvent(String type, com.getcapacitor.JSObject data);
    }

    private final EventEmitter emitter;
    private final String playerId;

    public YoutubePlayerJsBridge(EventEmitter emitter, String playerId) {
        this.emitter = emitter;
        this.playerId = playerId;
    }

    @JavascriptInterface
    public void postEvent(String type, String jsonPayload) {
        com.getcapacitor.JSObject data = new com.getcapacitor.JSObject();
        data.put("playerId", playerId);
        if (jsonPayload != null && !jsonPayload.isEmpty()) {
            try {
                org.json.JSONObject payload = new org.json.JSONObject(jsonPayload);
                java.util.Iterator<String> keys = payload.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    data.put(key, payload.get(key));
                }
            } catch (org.json.JSONException ignored) {
                // Keep playerId only.
            }
        }
        emitter.emitPlayerEvent(type, data);
    }
}
