package com.capgo.youtubeplayer;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;

/**
 * Unit tests for YoutubePlayer plugin
 *
 * These tests verify basic plugin structure and instantiation.
 * For full integration tests including plugin methods, use Android instrumentation tests.
 */
public class YoutubePlayerPluginTest {

    private YoutubePlayer plugin;

    @Before
    public void setUp() {
        plugin = new YoutubePlayer();
    }

    // MARK: - Plugin Instantiation Tests

    @Test
    public void testPluginInstantiation() {
        assertNotNull("Plugin should be instantiated", plugin);
    }

    @Test
    public void testPluginType() {
        assertTrue("Plugin should be instance of YoutubePlayer", plugin instanceof YoutubePlayer);
    }

    @Test
    public void testPluginClassExists() {
        // Verify the plugin class can be loaded
        try {
            Class<?> pluginClass = Class.forName("com.capgo.youtubeplayer.YoutubePlayer");
            assertNotNull("Plugin class should exist", pluginClass);
        } catch (ClassNotFoundException e) {
            fail("Plugin class not found: " + e.getMessage());
        }
    }

    @Test
    public void testPluginHandlerClassExists() {
        // Verify the handler class can be loaded
        try {
            Class<?> handlerClass = Class.forName("com.capgo.youtubeplayer.YoutubePlayerHandler");
            assertNotNull("Handler class should exist", handlerClass);
        } catch (ClassNotFoundException e) {
            fail("Handler class not found: " + e.getMessage());
        }
    }

    @Test
    public void testRxBusClassExists() {
        // Verify the RxBus class can be loaded
        try {
            Class<?> rxBusClass = Class.forName("com.capgo.youtubeplayer.RxBus");
            assertNotNull("RxBus class should exist", rxBusClass);
        } catch (ClassNotFoundException e) {
            fail("RxBus class not found: " + e.getMessage());
        }
    }

    @Test
    public void testYoutubePlayerFragmentClassExists() {
        // Verify the fragment class can be loaded
        try {
            Class<?> fragmentClass = Class.forName("com.capgo.youtubeplayer.YoutubePlayerFragment");
            assertNotNull("Fragment class should exist", fragmentClass);
        } catch (ClassNotFoundException e) {
            fail("Fragment class not found: " + e.getMessage());
        }
    }

    @Test
    public void testPluginHasInitializeMethod() {
        // Verify initialize method exists
        try {
            java.lang.reflect.Method initMethod = plugin.getClass().getMethod("initialize", com.getcapacitor.PluginCall.class);
            assertNotNull("Initialize method should exist", initMethod);
        } catch (NoSuchMethodException e) {
            fail("Initialize method not found: " + e.getMessage());
        }
    }

    @Test
    public void testPluginHasPauseVideoMethod() {
        // Verify pauseVideo method exists
        try {
            java.lang.reflect.Method pauseMethod = plugin.getClass().getMethod("pauseVideo", com.getcapacitor.PluginCall.class);
            assertNotNull("PauseVideo method should exist", pauseMethod);
        } catch (NoSuchMethodException e) {
            fail("PauseVideo method not found: " + e.getMessage());
        }
    }

    @Test
    public void testPluginHasGetPluginVersionMethod() {
        // Verify getPluginVersion method exists
        try {
            java.lang.reflect.Method versionMethod = plugin.getClass().getMethod("getPluginVersion", com.getcapacitor.PluginCall.class);
            assertNotNull("GetPluginVersion method should exist", versionMethod);
        } catch (NoSuchMethodException e) {
            fail("GetPluginVersion method not found: " + e.getMessage());
        }
    }

    @Test
    public void testPluginHasLoadMethod() {
        // Verify load method exists
        try {
            java.lang.reflect.Method loadMethod = plugin.getClass().getMethod("load");
            assertNotNull("Load method should exist", loadMethod);
        } catch (NoSuchMethodException e) {
            fail("Load method not found: " + e.getMessage());
        }
    }

    @Test
    public void testMultiplePluginInstances() {
        // Verify we can create multiple instances
        YoutubePlayer plugin1 = new YoutubePlayer();
        YoutubePlayer plugin2 = new YoutubePlayer();
        YoutubePlayer plugin3 = new YoutubePlayer();

        assertNotNull("First plugin instance should exist", plugin1);
        assertNotNull("Second plugin instance should exist", plugin2);
        assertNotNull("Third plugin instance should exist", plugin3);
        assertNotSame("Plugin instances should be different", plugin1, plugin2);
        assertNotSame("Plugin instances should be different", plugin2, plugin3);
    }

    @Test
    public void testPluginAnnotation() {
        // Verify the plugin has the @CapacitorPlugin annotation
        com.getcapacitor.annotation.CapacitorPlugin annotation =
            plugin.getClass().getAnnotation(com.getcapacitor.annotation.CapacitorPlugin.class);
        assertNotNull("Plugin should have @CapacitorPlugin annotation", annotation);
    }

    @Test
    public void testPluginMethodAnnotations() {
        // Count methods with @PluginMethod annotation
        int pluginMethodCount = 0;
        for (java.lang.reflect.Method method : plugin.getClass().getMethods()) {
            if (method.getAnnotation(com.getcapacitor.PluginMethod.class) != null) {
                pluginMethodCount++;
            }
        }
        assertTrue("Plugin should have at least one @PluginMethod", pluginMethodCount > 0);
    }

    @Test
    public void testHandlerInstantiation() {
        // Test that we can create a handler instance
        try {
            YoutubePlayerHandler handler = new YoutubePlayerHandler();
            assertNotNull("Handler should be instantiated", handler);
        } catch (Exception e) {
            fail("Failed to instantiate handler: " + e.getMessage());
        }
    }

    @Test
    public void testHandlerHasPauseVideoMethod() {
        // Verify handler has pauseVideo method
        try {
            YoutubePlayerHandler handler = new YoutubePlayerHandler();
            java.lang.reflect.Method pauseMethod = handler.getClass().getMethod("pauseVideo",
                com.google.android.youtube.player.YouTubePlayer.class);
            assertNotNull("Handler should have pauseVideo method", pauseMethod);
        } catch (NoSuchMethodException e) {
            fail("Handler pauseVideo method not found: " + e.getMessage());
        } catch (Exception e) {
            fail("Failed to test handler method: " + e.getMessage());
        }
    }
}
