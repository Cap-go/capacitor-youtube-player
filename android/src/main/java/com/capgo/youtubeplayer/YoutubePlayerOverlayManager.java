package com.capgo.youtubeplayer;

import android.annotation.SuppressLint;
import android.graphics.Color;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.FrameLayout;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import java.util.HashMap;
import java.util.Map;

final class YoutubePlayerOverlayManager {

    static final class PlayerContainer {

        final FrameLayout containerView;
        final WebView webView;
        YoutubePlayerFrame frame;

        PlayerContainer(FrameLayout containerView, WebView webView, YoutubePlayerFrame frame) {
            this.containerView = containerView;
            this.webView = webView;
            this.frame = frame;
        }
    }

    private final Bridge bridge;
    private final YoutubePlayerJsBridge.EventEmitter eventEmitter;
    private final Map<String, PlayerContainer> players = new HashMap<>();

    YoutubePlayerOverlayManager(Bridge bridge, YoutubePlayerJsBridge.EventEmitter eventEmitter) {
        this.bridge = bridge;
        this.eventEmitter = eventEmitter;
    }

    PlayerContainer get(String playerId) {
        return players.get(playerId);
    }

    void pauseAll() {
        for (String playerId : players.keySet()) {
            executeJavaScript(playerId, "executePlayerCommand('pauseVideo')");
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    PlayerContainer create(String playerId, String videoId, YoutubePlayerFrame frame, String playerVarsJson, String origin) {
        ViewGroup parent = (ViewGroup) bridge.getWebView().getParent();
        float density = bridge.getActivity().getResources().getDisplayMetrics().density;

        FrameLayout container = new FrameLayout(bridge.getContext());
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
            Math.round(frame.width * density),
            Math.round(frame.height * density)
        );
        params.leftMargin = Math.round(frame.x * density);
        params.topMargin = Math.round(frame.y * density);
        container.setLayoutParams(params);
        container.setBackgroundColor(Color.BLACK);

        WebView webView = new WebView(bridge.getContext());
        webView.setLayoutParams(new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDomStorageEnabled(true);
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(
            new YoutubePlayerJsBridge((type, data) -> eventEmitter.emitPlayerEvent(type, data), playerId),
            "CapgoYoutubePlayerBridge"
        );
        container.addView(webView);
        parent.addView(container);

        String html = YoutubePlayerHtmlBuilder.build(videoId, playerId, playerVarsJson, origin);
        webView.loadDataWithBaseURL("https://www.youtube.com", html, "text/html", "UTF-8", null);

        PlayerContainer playerContainer = new PlayerContainer(container, webView, frame);
        players.put(playerId, playerContainer);
        return playerContainer;
    }

    void updateFrame(String playerId, YoutubePlayerFrame frame) {
        PlayerContainer player = players.get(playerId);
        if (player == null) {
            return;
        }
        float density = bridge.getActivity().getResources().getDisplayMetrics().density;
        FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) player.containerView.getLayoutParams();
        params.width = Math.round(frame.width * density);
        params.height = Math.round(frame.height * density);
        params.leftMargin = Math.round(frame.x * density);
        params.topMargin = Math.round(frame.y * density);
        player.containerView.setLayoutParams(params);
        player.frame = frame;
    }

    void destroy(String playerId) {
        PlayerContainer player = players.remove(playerId);
        if (player == null) {
            return;
        }
        player.webView.loadUrl("about:blank");
        player.webView.removeJavascriptInterface("CapgoYoutubePlayerBridge");
        player.webView.destroy();
        ViewGroup parent = (ViewGroup) player.containerView.getParent();
        if (parent != null) {
            parent.removeView(player.containerView);
        }
    }

    void executeJavaScript(String playerId, String script) {
        PlayerContainer player = players.get(playerId);
        if (player == null) {
            return;
        }
        player.webView.post(() -> player.webView.evaluateJavascript(script, null));
    }
}
