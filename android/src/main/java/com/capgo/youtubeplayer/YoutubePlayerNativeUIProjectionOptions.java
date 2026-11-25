package com.capgo.youtubeplayer;

import com.getcapacitor.PluginCall;

final class YoutubePlayerNativeUIProjectionOptions {

    private YoutubePlayerNativeUIProjectionOptions() {}

    static boolean isEnabled(PluginCall call) {
        return Boolean.TRUE.equals(call.getBoolean("nativeUIProjection", false));
    }

    static String resolveSelector(PluginCall call, String playerId) {
        if (!isEnabled(call)) {
            return null;
        }
        String selector = call.getString("projectionSelector");
        if (selector != null && !selector.trim().isEmpty()) {
            return selector.trim();
        }
        String elementId = call.getString("elementId");
        String id = elementId != null && !elementId.trim().isEmpty() ? elementId.trim() : playerId;
        if (id.isEmpty()) {
            throw new IllegalArgumentException("projectionSelector is required when nativeUIProjection is enabled");
        }
        if (id.startsWith("#") || id.startsWith(".") || id.startsWith("[")) {
            return id;
        }
        return "#" + id;
    }
}
