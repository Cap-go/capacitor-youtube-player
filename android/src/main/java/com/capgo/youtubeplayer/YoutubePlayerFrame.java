package com.capgo.youtubeplayer;

public final class YoutubePlayerFrame {

    public static final int MIN_DIMENSION = 200;

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

    public static YoutubePlayerFrame from(com.getcapacitor.JSObject playerFrame, com.getcapacitor.JSObject playerSize) {
        if (playerFrame != null) {
            return new YoutubePlayerFrame(
                playerFrame.getFloat("x", 0f),
                playerFrame.getFloat("y", 0f),
                playerFrame.getFloat("width", MIN_DIMENSION),
                playerFrame.getFloat("height", MIN_DIMENSION)
            );
        }

        float width = playerSize != null ? playerSize.getFloat("width", MIN_DIMENSION) : MIN_DIMENSION;
        float height = playerSize != null ? playerSize.getFloat("height", MIN_DIMENSION) : MIN_DIMENSION;
        return new YoutubePlayerFrame(0f, 0f, width, height);
    }
}
