package com.capgo.youtubeplayer;

import android.util.Log;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import io.github.webview_native_ui.engine.NativeUIProjection;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

final class YoutubePlayerNativeUIProjectionCoordinator {

    private static final String TAG = "YtNativeUIProjection";

    private final Bridge bridge;
    private final String pluginId;
    private boolean channelInstalled;
    private final Map<String, NativeUIProjection> projections = new HashMap<>();
    private final Set<String> enabledPlayerIds = new HashSet<>();

    YoutubePlayerNativeUIProjectionCoordinator(Bridge bridge, String pluginId) {
        this.bridge = bridge;
        this.pluginId = pluginId;
    }

    boolean hasActiveRegistrations() {
        return !projections.isEmpty();
    }

    boolean isEnabledForPlayer(String playerId) {
        return enabledPlayerIds.contains(playerId);
    }

    void ensureChannelInstalled() {
        if (channelInstalled) {
            return;
        }
        WebView webView = bridge.getWebView();
        try {
            NativeUIProjection.install(webView);
            channelInstalled = true;
        } catch (Exception error) {
            throw new IllegalStateException("Native UI projection channel unavailable: " + error.getMessage(), error);
        }
    }

    void register(String playerId, String projectionSelector, View nativeView) {
        close(playerId);
        NativeUIProjection.ReceiveListeners listeners = new NativeUIProjection.ReceiveListeners(
            Arrays.asList("playerFrameChanged"),
            new NativeUIProjection.ReceiveListeners.Projection(
                Arrays.asList("inlinePlayerShown"),
                Arrays.asList("webOverlayBegan"),
                Arrays.asList("inlinePlayerHidden")
            ),
            Collections.<String, Object>singletonMap("playerId", playerId)
        );
        NativeUIProjection projection = new NativeUIProjection(
            bridge.getActivity().getWindow(),
            bridge.getWebView(),
            pluginId,
            projectionSelector,
            listeners,
            null,
            NativeUIProjection.FailedFallback.WEB,
            NativeUIProjection.CaptureMode.COMPOSITED,
            () -> true,
            () -> kotlin.Unit.INSTANCE,
            null,
            NativeUIProjection.Runtime.CAPACITOR,
            50,
            Collections.emptyMap(),
            null,
            () -> nativeView
        );
        enabledPlayerIds.add(playerId);
        projections.put(playerId, projection);
    }

    void close(String playerId) {
        enabledPlayerIds.remove(playerId);
        NativeUIProjection projection = projections.remove(playerId);
        if (projection != null) {
            try {
                projection.close();
            } catch (Exception error) {
                Log.w(TAG, "Failed to close projection for " + playerId, error);
            }
        }
    }

    void closeAll() {
        for (String playerId : new HashSet<>(projections.keySet())) {
            close(playerId);
        }
        enabledPlayerIds.clear();
    }

    void receive(String eventName, JSObject data) {
        if (projections.isEmpty()) {
            return;
        }
        bridge.getActivity().runOnUiThread(() -> {
            if (projections.isEmpty()) {
                return;
            }
            for (NativeUIProjection projection : projections.values()) {
                projection.receive(eventName, data);
            }
        });
    }
}
