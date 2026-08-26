package com.capgo.youtubeplayer;

import static org.junit.Assert.*;

import org.json.JSONObject;
import org.junit.Test;

public class YoutubePlayerJsResultParserTest {

    @Test
    public void parseDecodesQuotedJsonStringFromEvaluateJavascript() throws Exception {
        JSONObject parsed = YoutubePlayerJsResultParser.parse("\"{\\\"success\\\":true,\\\"value\\\":42}\"");
        assertTrue(parsed.getBoolean("success"));
        assertEquals(42, parsed.getInt("value"));
    }

    @Test
    public void parseAcceptsDirectJSONObjectString() throws Exception {
        JSONObject parsed = YoutubePlayerJsResultParser.parse("{\"success\":true,\"value\":true}");
        assertTrue(parsed.getBoolean("success"));
        assertTrue(parsed.getBoolean("value"));
    }

    @Test(expected = org.json.JSONException.class)
    public void parseRejectsNullResult() throws Exception {
        YoutubePlayerJsResultParser.parse(null);
    }
}
