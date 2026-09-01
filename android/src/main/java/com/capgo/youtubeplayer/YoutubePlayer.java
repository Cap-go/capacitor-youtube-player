package com.capgo.youtubeplayer;

import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.webkit.CookieManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer;
import io.reactivex.disposables.Disposable;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONObject;

@CapacitorPlugin(name = "YoutubePlayer")
public class YoutubePlayer extends Plugin {

    private static final String TAG = YoutubePlayer.class.getSimpleName();
    private static final long INITIALIZE_TIMEOUT_MS = 30_000L;

    private final String pluginVersion = "";
    private Handler mainHandler;
    private final Map<String, PluginCall> pendingInitializeCalls = new HashMap<>();
    private final Map<String, Runnable> pendingInitializeTimeouts = new HashMap<>();

    private YoutubePlayerOverlayManager overlayManager;
    private Disposable fullscreenReadySubscription;

    @Override
    public void load() {
        overlayManager = new YoutubePlayerOverlayManager(getBridge(), this::emitPlayerEvent);
    }

    private Handler mainHandler() {
        if (mainHandler == null) {
            mainHandler = new Handler(Looper.getMainLooper());
        }
        return mainHandler;
    }

    public void emitPlayerEvent(String type, JSObject data) {
        notifyListeners(type, data);
        if ("playerReady".equals(type) && data != null) {
            String playerId = data.getString("playerId");
            if (playerId != null) {
                resolvePendingInitialize(playerId, false);
            }
        }
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        if (overlayManager != null) {
            overlayManager.pauseAll();
        }
        YouTubePlayer player = YoutubePlayerActivity.getCurrentPlayer();
        if (player != null) {
            player.pause();
        }
    }

    @Override
    protected void handleOnDestroy() {
        disposeFullscreenSubscription();
        super.handleOnDestroy();
    }

    @PluginMethod
    public void createPlayer(final PluginCall call) {
        if (call.getString("videoId") == null) {
            call.reject("Missing required parameter: videoId");
            return;
        }
        if (call.getObject("playerFrame") == null) {
            call.reject("Missing required parameter: playerFrame");
            return;
        }
        initialize(call);
    }

    @PluginMethod
    public void setPlayerFrame(final PluginCall call) {
        String playerId = call.getString("playerId");
        if (playerId == null) {
            call.reject("Missing playerId parameter");
            return;
        }
        try {
            YoutubePlayerFrame frame = new YoutubePlayerFrame(
                readFloat(call, "x", 0f),
                readFloat(call, "y", 0f),
                readFloat(call, "width", YoutubePlayerFrame.MIN_DIMENSION),
                readFloat(call, "height", YoutubePlayerFrame.MIN_DIMENSION)
            );
            getBridge()
                .getActivity()
                .runOnUiThread(() -> {
                    overlayManager.updateFrame(playerId, frame);
                    JSObject result = new JSObject();
                    JSObject value = new JSObject();
                    value.put("x", frame.x);
                    value.put("y", frame.y);
                    value.put("width", frame.width);
                    value.put("height", frame.height);
                    result.put("method", "setPlayerFrame");
                    result.put("value", value);
                    JSObject ret = new JSObject();
                    ret.put("result", result);
                    call.resolve(ret);
                });
        } catch (IllegalArgumentException error) {
            call.reject(error.getMessage());
        }
    }

    @PluginMethod
    public void initialize(final PluginCall call) {
        String videoId = call.getString("videoId");
        String playerId = call.getString("playerId");
        Boolean fullscreen = call.getBoolean("fullscreen", false);
        JSObject playerSize = call.getObject("playerSize");
        JSObject playerFrame = call.getObject("playerFrame");
        String cookies = call.getString("cookies");

        if (videoId == null || playerId == null) {
            call.reject("Missing required parameters: videoId and playerId");
            return;
        }

        if (cookies != null && !cookies.isEmpty()) {
            setCookies(cookies);
        }

        if (playerFrame == null) {
            launchLegacyFullscreenActivity(call, videoId, playerId, fullscreen);
            return;
        }

        try {
            YoutubePlayerFrame frame = YoutubePlayerFrame.from(playerFrame, playerSize);
            JSObject playerVars = call.getObject("playerVars", new JSObject());
            if (!playerVars.has("origin")) {
                playerVars.put("origin", webViewOrigin());
            }
            playerVars.put("playsinline", 1);
            playerVars.put("enablejsapi", 1);
            if (call.getBoolean("autoplay", false)) {
                playerVars.put("autoplay", 1);
            }

            String playerVarsJson = playerVars.toString();
            String origin = playerVars.getString("origin", webViewOrigin());

            call.setKeepAlive(true);
            pendingInitializeCalls.put(playerId, call);
            Runnable timeoutRunnable = () -> resolvePendingInitialize(playerId, true);
            pendingInitializeTimeouts.put(playerId, timeoutRunnable);
            mainHandler().postDelayed(timeoutRunnable, INITIALIZE_TIMEOUT_MS);

            getBridge()
                .getActivity()
                .runOnUiThread(() -> overlayManager.create(playerId, videoId, frame, playerVarsJson, origin));
        } catch (IllegalArgumentException error) {
            call.reject(error.getMessage());
        }
    }

    private void launchLegacyFullscreenActivity(final PluginCall call, String videoId, String playerId, Boolean fullscreen) {
        Intent intent = new Intent();
        intent.setClass(getContext(), YoutubePlayerActivity.class);
        intent.putExtra("videoId", videoId);
        intent.putExtra("playerId", playerId);
        intent.putExtra("fullscreen", fullscreen);
        getActivity().startActivity(intent);

        disposeFullscreenSubscription();
        fullscreenReadySubscription = RxBus.subscribe((o) -> {
            if (o instanceof YoutubePlayerActivity.ActivityDestroyedSignal) {
                disposeFullscreenSubscription();
                return;
            }
            if (o instanceof JSObject) {
                disposeFullscreenSubscription();
                String message = ((JSObject) o).getString("message");
                JSObject ret = new JSObject();
                ret.put("value", message);
                call.resolve(ret);
            }
        });
    }

    private void disposeFullscreenSubscription() {
        if (fullscreenReadySubscription != null && !fullscreenReadySubscription.isDisposed()) {
            fullscreenReadySubscription.dispose();
        }
        fullscreenReadySubscription = null;
    }

    private void resolvePendingInitialize(String playerId, boolean timedOut) {
        Runnable timeoutRunnable = pendingInitializeTimeouts.remove(playerId);
        if (timeoutRunnable != null) {
            mainHandler().removeCallbacks(timeoutRunnable);
        }

        PluginCall pending = pendingInitializeCalls.remove(playerId);
        if (pending == null) {
            return;
        }

        if (timedOut) {
            getBridge()
                .getActivity()
                .runOnUiThread(() -> overlayManager.destroy(playerId));
            pending.reject("Player ready timed out");
            return;
        }

        JSObject ret = new JSObject();
        ret.put("playerReady", true);
        ret.put("player", playerId);
        pending.resolve(ret);
    }

    @PluginMethod
    public void destroy(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        cancelPendingInitialize(playerId);
        getBridge()
            .getActivity()
            .runOnUiThread(() -> {
                overlayManager.destroy(playerId);
                resolveBoolean(call, "destroy", true);
            });
    }

    @PluginMethod
    public void playVideo(final PluginCall call) {
        runPlayerCommand(call, "playVideo");
    }

    @PluginMethod
    public void pauseVideo(final PluginCall call) {
        String playerId = call.getString("playerId");
        if (playerId == null) {
            call.reject("Missing playerId parameter");
            return;
        }

        if (overlayManager.get(playerId) != null) {
            overlayManager.executeJavaScript(playerId, "executePlayerCommand('pauseVideo')");
        } else if (YoutubePlayerActivity.matchesPlayerId(playerId)) {
            YouTubePlayer player = YoutubePlayerActivity.getCurrentPlayer();
            if (player != null) {
                player.pause();
            }
        } else {
            call.reject("Player not found");
            return;
        }

        JSObject ret = new JSObject();
        ret.put("value", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopVideo(final PluginCall call) {
        runPlayerCommand(call, "stopVideo");
    }

    @PluginMethod
    public void seekTo(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        double seconds = call.getDouble("seconds", 0d);
        boolean allowSeekAhead = call.getBoolean("allowSeekAhead", true);
        routeJavaScript(playerId, "executePlayerCommand('seekTo'," + seconds + "," + allowSeekAhead + ")");
        JSObject result = new JSObject();
        result.put("method", "seekTo");
        result.put("value", true);
        result.put("seconds", seconds);
        result.put("allowSeekAhead", allowSeekAhead);
        JSObject ret = new JSObject();
        ret.put("result", result);
        call.resolve(ret);
    }

    @PluginMethod
    public void loadVideoById(final PluginCall call) {
        runPlayerCommandWithOptions(call, "loadVideoById", "options", true);
    }

    @PluginMethod
    public void cueVideoById(final PluginCall call) {
        runPlayerCommandWithOptions(call, "cueVideoById", "options", true);
    }

    @PluginMethod
    public void loadVideoByUrl(final PluginCall call) {
        runPlayerCommandWithOptions(call, "loadVideoByUrl", "options", true);
    }

    @PluginMethod
    public void cueVideoByUrl(final PluginCall call) {
        runPlayerCommandWithOptions(call, "cueVideoByUrl", "options", true);
    }

    @PluginMethod
    public void mute(final PluginCall call) {
        runPlayerCommand(call, "mute");
    }

    @PluginMethod
    public void unMute(final PluginCall call) {
        runPlayerCommand(call, "unMute");
    }

    @PluginMethod
    public void isMuted(final PluginCall call) {
        runPlayerCommandValue(call, "isMuted");
    }

    @PluginMethod
    public void setVolume(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        int volume = call.getInt("volume", 50);
        routeJavaScript(playerId, "executePlayerCommand('setVolume'," + volume + ")");
        JSObject result = new JSObject();
        result.put("method", "setVolume");
        result.put("value", volume);
        JSObject ret = new JSObject();
        ret.put("result", result);
        call.resolve(ret);
    }

    @PluginMethod
    public void getVolume(final PluginCall call) {
        runPlayerCommandValue(call, "getVolume");
    }

    @PluginMethod
    public void setSize(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        try {
            YoutubePlayerOverlayManager.PlayerContainer player = overlayManager.get(playerId);
            float x = player != null ? player.frame.x : 0f;
            float y = player != null ? player.frame.y : 0f;
            YoutubePlayerFrame frame = new YoutubePlayerFrame(
                x,
                y,
                readFloat(call, "width", YoutubePlayerFrame.MIN_DIMENSION),
                readFloat(call, "height", YoutubePlayerFrame.MIN_DIMENSION)
            );
            getBridge()
                .getActivity()
                .runOnUiThread(() -> {
                    overlayManager.updateFrame(playerId, frame);
                    JSObject value = new JSObject();
                    value.put("width", frame.width);
                    value.put("height", frame.height);
                    JSObject result = new JSObject();
                    result.put("method", "setSize");
                    result.put("value", value);
                    JSObject ret = new JSObject();
                    ret.put("result", result);
                    call.resolve(ret);
                });
        } catch (IllegalArgumentException error) {
            call.reject(error.getMessage());
        }
    }

    @PluginMethod
    public void getPlaybackRate(final PluginCall call) {
        runPlayerCommandValue(call, "getPlaybackRate");
    }

    @PluginMethod
    public void setPlaybackRate(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        double rate = call.getDouble("suggestedRate", 1d);
        routeJavaScript(playerId, "executePlayerCommand('setPlaybackRate'," + rate + ")");
        resolveBoolean(call, "setPlaybackRate", true);
    }

    @PluginMethod
    public void setLoop(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        boolean loop = call.getBoolean("loopPlaylists", false);
        routeJavaScript(playerId, "executePlayerCommand('setLoop'," + loop + ")");
        resolveBoolean(call, "setLoop", true);
    }

    @PluginMethod
    public void setShuffle(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        boolean shuffle = call.getBoolean("shufflePlaylist", false);
        routeJavaScript(playerId, "executePlayerCommand('setShuffle'," + shuffle + ")");
        resolveBoolean(call, "setShuffle", true);
    }

    @PluginMethod
    public void getVideoLoadedFraction(final PluginCall call) {
        runPlayerCommandValue(call, "getVideoLoadedFraction");
    }

    @PluginMethod
    public void getPlayerState(final PluginCall call) {
        runPlayerCommandValue(call, "getPlayerState");
    }

    @PluginMethod
    public void getCurrentTime(final PluginCall call) {
        runPlayerCommandValue(call, "getCurrentTime");
    }

    @PluginMethod
    public void getDuration(final PluginCall call) {
        runPlayerCommandValue(call, "getDuration");
    }

    @PluginMethod
    public void getVideoUrl(final PluginCall call) {
        runPlayerCommandValue(call, "getVideoUrl");
    }

    @PluginMethod
    public void getVideoEmbedCode(final PluginCall call) {
        runPlayerCommandValue(call, "getVideoEmbedCode");
    }

    @PluginMethod
    public void getPlaylist(final PluginCall call) {
        runPlayerCommandValue(call, "getPlaylist");
    }

    @PluginMethod
    public void getPlaylistIndex(final PluginCall call) {
        runPlayerCommandValue(call, "getPlaylistIndex");
    }

    @PluginMethod
    public void cuePlaylist(final PluginCall call) {
        runPlayerCommandWithOptions(call, "cuePlaylist", "playlistOptions", false);
    }

    @PluginMethod
    public void loadPlaylist(final PluginCall call) {
        runPlayerCommandWithOptions(call, "loadPlaylist", "playlistOptions", false);
    }

    @PluginMethod
    public void nextVideo(final PluginCall call) {
        runPlayerCommand(call, "nextVideo");
    }

    @PluginMethod
    public void previousVideo(final PluginCall call) {
        runPlayerCommand(call, "previousVideo");
    }

    @PluginMethod
    public void playVideoAt(final PluginCall call) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        int index = call.getInt("index", 0);
        routeJavaScript(playerId, "executePlayerCommand('playVideoAt'," + index + ")");
        resolveBoolean(call, "playVideoAt", true);
    }

    @PluginMethod
    public void toggleFullScreen(final PluginCall call) {
        boolean isFullScreen = call.getBoolean("isFullScreen", true);
        String playerId = call.getString("playerId", "");
        JSObject data = new JSObject();
        data.put("playerId", playerId);
        data.put("isFullscreen", isFullScreen);
        notifyListeners("fullscreenChange", data);
        JSObject result = new JSObject();
        result.put("method", "toggleFullScreen");
        result.put("value", isFullScreen);
        JSObject ret = new JSObject();
        ret.put("result", result);
        call.resolve(ret);
    }

    @PluginMethod
    public void getPlaybackQuality(final PluginCall call) {
        runPlayerCommandValue(call, "getPlaybackQuality");
    }

    @PluginMethod
    public void setPlaybackQuality(final PluginCall call) {
        String playerId = requirePlayerId(call);
        String quality = call.getString("suggestedQuality");
        if (playerId == null || quality == null) {
            call.reject("Missing playerId or suggestedQuality");
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        routeJavaScript(playerId, "executePlayerCommand('setPlaybackQuality','" + quality + "')");
        resolveBoolean(call, "setPlaybackQuality", true);
    }

    @PluginMethod
    public void getAvailableQualityLevels(final PluginCall call) {
        runPlayerCommandValue(call, "getAvailableQualityLevels");
    }

    @PluginMethod
    public void getPluginVersion(final PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("version", pluginVersion);
        call.resolve(ret);
    }

    private float readFloat(PluginCall call, String key, float defaultValue) {
        Double value = call.getDouble(key);
        return value != null ? value.floatValue() : defaultValue;
    }

    private String requirePlayerId(PluginCall call) {
        String playerId = call.getString("playerId");
        if (playerId == null) {
            call.reject("Missing playerId parameter");
            return null;
        }
        return playerId;
    }

    private boolean hasPlayer(String playerId) {
        return overlayManager.get(playerId) != null || YoutubePlayerActivity.matchesPlayerId(playerId);
    }

    private void cancelPendingInitialize(String playerId) {
        Runnable timeoutRunnable = pendingInitializeTimeouts.remove(playerId);
        if (timeoutRunnable != null) {
            mainHandler().removeCallbacks(timeoutRunnable);
        }
        pendingInitializeCalls.remove(playerId);
    }

    private void routeJavaScript(String playerId, String script) {
        if (overlayManager.get(playerId) != null) {
            overlayManager.executeJavaScript(playerId, script);
        }
    }

    private void runPlayerCommand(PluginCall call, String command) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }

        if (overlayManager.get(playerId) != null) {
            overlayManager.executeJavaScript(playerId, "executePlayerCommand('" + command + "')");
        } else if (YoutubePlayerActivity.matchesPlayerId(playerId)) {
            routeFullscreenCommand(command);
        }

        resolveBoolean(call, command, true);
    }

    private void routeFullscreenCommand(String command) {
        YouTubePlayer player = YoutubePlayerActivity.getCurrentPlayer();
        if (player == null) {
            return;
        }
        switch (command) {
            case "playVideo":
                player.play();
                break;
            case "pauseVideo":
                player.pause();
                break;
            case "stopVideo":
                player.pause();
                break;
            case "mute":
                player.mute();
                break;
            case "unMute":
                player.unMute();
                break;
            case "nextVideo":
                player.nextVideo();
                break;
            case "previousVideo":
                player.previousVideo();
                break;
            default:
                break;
        }
    }

    private void runPlayerCommandWithOptions(PluginCall call, String command, String optionsKey, boolean includeOptions) {
        String playerId = requirePlayerId(call);
        JSObject options = call.getObject(optionsKey);
        if (playerId == null || options == null) {
            call.reject("Missing playerId or " + optionsKey);
            return;
        }
        if (!hasPlayer(playerId)) {
            call.reject("Player not found");
            return;
        }
        if (overlayManager.get(playerId) != null) {
            overlayManager.executeJavaScript(playerId, "executePlayerCommand('" + command + "'," + options.toString() + ")");
        }
        JSObject result = new JSObject();
        result.put("method", command);
        result.put("value", true);
        if (includeOptions) {
            result.put("options", options);
        }
        JSObject ret = new JSObject();
        ret.put("result", result);
        call.resolve(ret);
    }

    private void runPlayerCommandValue(PluginCall call, String command) {
        String playerId = requirePlayerId(call);
        if (playerId == null) {
            return;
        }
        YoutubePlayerOverlayManager.PlayerContainer player = overlayManager.get(playerId);
        if (player == null) {
            call.reject("Player not found");
            return;
        }
        player.webView.evaluateJavascript("executePlayerCommand('" + command + "')", (value) -> {
            try {
                JSONObject parsed = YoutubePlayerJsResultParser.parse(value);
                if (!parsed.optBoolean("success", false)) {
                    call.reject("Failed to execute " + command + ": " + parsed.optString("error", "unknown"));
                    return;
                }
                JSObject result = new JSObject();
                result.put("method", command);
                result.put("value", parsed.opt("value"));
                JSObject ret = new JSObject();
                ret.put("result", result);
                call.resolve(ret);
            } catch (Exception error) {
                call.reject("Failed to execute " + command, error);
            }
        });
    }

    private void resolveBoolean(PluginCall call, String method, boolean value) {
        JSObject result = new JSObject();
        result.put("method", method);
        result.put("value", value);
        JSObject ret = new JSObject();
        ret.put("result", result);
        call.resolve(ret);
    }

    private String webViewOrigin() {
        String url = getBridge().getWebView().getUrl();
        if (url == null || url.isEmpty()) {
            return "https://localhost";
        }
        return url;
    }

    private void setCookies(String cookieString) {
        try {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);

            String[] cookiePairs = cookieString.split(";");
            for (String pair : cookiePairs) {
                String trimmedPair = pair.trim();
                if (!trimmedPair.isEmpty()) {
                    cookieManager.setCookie(".youtube.com", trimmedPair + "; path=/; secure");
                    cookieManager.setCookie("youtube.com", trimmedPair + "; path=/; secure");
                }
            }
            cookieManager.flush();
        } catch (Exception e) {
            Log.e(TAG, "Error setting cookies: " + e.getMessage(), e);
        }
    }
}
