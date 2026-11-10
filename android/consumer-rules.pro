# @capgo/capacitor-youtube-player: rules merged into app release minification (R8)

# WebView calls JavaScript bridge methods by name. R8 can strip or rename @JavascriptInterface
# methods, which breaks the injected bridge used in YoutubePlayerOverlayManager (name CapgoYoutubePlayerBridge).
-keepclassmembers class com.capgo.youtubeplayer.YoutubePlayerJsBridge {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor discovers plugin methods via reflection on the class annotated with @CapacitorPlugin.
# Keep this class and its @PluginMethod entry points so the bridge stays callable from JS.
-keep class com.capgo.youtubeplayer.YoutubePlayer {
    @com.getcapacitor.PluginMethod <methods>;
}
