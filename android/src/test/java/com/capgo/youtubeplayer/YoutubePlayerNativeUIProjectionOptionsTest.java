package com.capgo.youtubeplayer;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import com.getcapacitor.PluginCall;
import org.junit.Test;

public class YoutubePlayerNativeUIProjectionOptionsTest {

    @Test
    public void testNativeUIProjectionDisabledByDefault() {
        PluginCall call = mock(PluginCall.class);
        when(call.getBoolean("nativeUIProjection", false)).thenReturn(false);
        assertFalse(YoutubePlayerNativeUIProjectionOptions.isEnabled(call));
        assertNull(YoutubePlayerNativeUIProjectionOptions.resolveSelector(call, "yt-player"));
    }

    @Test
    public void testResolveSelectorUsesDomIdWhenEnabled() {
        PluginCall call = mock(PluginCall.class);
        when(call.getBoolean("nativeUIProjection", false)).thenReturn(true);
        when(call.getString("projectionSelector")).thenReturn(null);
        when(call.getString("elementId")).thenReturn(null);
        assertEquals("[id=\"yt-player\"]", YoutubePlayerNativeUIProjectionOptions.resolveSelector(call, "yt-player"));
    }

    @Test
    public void testResolveSelectorUsesExplicitProjectionSelector() {
        PluginCall call = mock(PluginCall.class);
        when(call.getBoolean("nativeUIProjection", false)).thenReturn(true);
        when(call.getString("projectionSelector")).thenReturn("#custom-slot");
        assertEquals("#custom-slot", YoutubePlayerNativeUIProjectionOptions.resolveSelector(call, "yt-player"));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testResolveSelectorRequiresIdWhenEnabled() {
        PluginCall call = mock(PluginCall.class);
        when(call.getBoolean("nativeUIProjection", false)).thenReturn(true);
        when(call.getString("projectionSelector")).thenReturn(null);
        when(call.getString("elementId")).thenReturn("   ");
        YoutubePlayerNativeUIProjectionOptions.resolveSelector(call, "   ");
    }
}
