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
        String trimmed = value.trim();
        while (!trimmed.isEmpty() && isAmbiguousWhitespace(trimmed.charAt(0))) {
            trimmed = trimmed.substring(1);
        }
        while (!trimmed.isEmpty() && isAmbiguousWhitespace(trimmed.charAt(trimmed.length() - 1))) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    private static boolean isAmbiguousWhitespace(char character) {
        return character == '\u00A0' || character == '\u2007' || character == '\u202F';
    }

    private static String domIdSelector(String id) {
        String escaped = id.replace("\\", "\\\\").replace("\"", "\\\"");
        return "[id=\"" + escaped + "\"]";
    }
}
