package com.capgo.youtubeplayer;

import org.json.JSONException;
import org.json.JSONObject;

/** Parses {@code WebView.evaluateJavascript} callback strings into command result objects. */
final class YoutubePlayerJsResultParser {

    private YoutubePlayerJsResultParser() {}

    static JSONObject parse(String value) throws JSONException {
        if (value == null || "null".equals(value)) {
            throw new JSONException("Null JavaScript result");
        }
        Object jsonValue = new org.json.JSONTokener(value).nextValue();
        if (jsonValue instanceof String) {
            return new JSONObject((String) jsonValue);
        }
        if (jsonValue instanceof JSONObject) {
            return (JSONObject) jsonValue;
        }
        throw new JSONException("Unexpected JavaScript result type");
    }
}
