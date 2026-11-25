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
        String selector = stripSelector(call.getString("projectionSelector"));
        if (!selector.isEmpty()) {
            return selector;
        }
        String elementId = call.getString("elementId");
        String id = elementId != null && !elementId.trim().isEmpty() ? elementId.trim() : playerId == null ? "" : playerId.trim();
        if (id.isEmpty()) {
            throw new IllegalArgumentException("projectionSelector is required when nativeUIProjection is enabled");
        }
        return domIdSelector(id);
    }

    private static String stripSelector(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("^[\\p{IsWhite_Space}\\u00A0\\u2007\\u202F]+|[\\p{IsWhite_Space}\\u00A0\\u2007\\u202F]+$", "");
    }

    private static String domIdSelector(String id) {
        String escaped = id.replace("\\", "\\\\").replace("\"", "\\\"");
        return "[id=\"" + escaped + "\"]";
    }
}
