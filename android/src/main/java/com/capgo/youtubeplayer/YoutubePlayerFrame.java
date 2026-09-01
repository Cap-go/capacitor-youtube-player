package com.capgo.youtubeplayer;

import com.getcapacitor.JSObject;

public final class YoutubePlayerFrame {

    public static final float MIN_DIMENSION = 200f;

    public final float x;
    public final float y;
    public final float width;
    public final float height;

    public YoutubePlayerFrame(float x, float y, float width, float height) {
        if (!Float.isFinite(x) || !Float.isFinite(y)) {
            throw new IllegalArgumentException("Player frame x and y must be finite numbers");
        }
        if (!Float.isFinite(width) || !Float.isFinite(height) || width < MIN_DIMENSION || height < MIN_DIMENSION) {
            throw new IllegalArgumentException("Player frame must be at least 200x200 CSS pixels");
        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public static YoutubePlayerFrame from(JSObject playerFrame, JSObject playerSize) {
        if (playerFrame != null) {
            return new YoutubePlayerFrame(
                readFloat(playerFrame, "x", 0f),
                readFloat(playerFrame, "y", 0f),
                readFloat(playerFrame, "width", MIN_DIMENSION),
                readFloat(playerFrame, "height", MIN_DIMENSION)
            );
        }

        float width = playerSize != null ? readFloat(playerSize, "width", MIN_DIMENSION) : MIN_DIMENSION;
        float height = playerSize != null ? readFloat(playerSize, "height", MIN_DIMENSION) : MIN_DIMENSION;
        return new YoutubePlayerFrame(0f, 0f, width, height);
    }

    private static float readFloat(JSObject object, String key, float defaultValue) {
        try {
            Double value = object.getDouble(key);
            return value != null ? value.floatValue() : defaultValue;
        } catch (org.json.JSONException error) {
            return defaultValue;
        }
    }
}
