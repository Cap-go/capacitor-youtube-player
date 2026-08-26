package com.capgo.youtubeplayer;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import com.getcapacitor.JSObject;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.PlayerConstants;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.options.IFramePlayerOptions;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView;

public class YoutubePlayerActivity extends AppCompatActivity {

    private static final String TAG = "YoutubePlayerActivity";
    private YouTubePlayerView youTubePlayerView;
    private YouTubePlayer youTubePlayer;
    private String videoId;
    private String playerId;

    private static YoutubePlayerActivity currentInstance;

    /** Returns the current active player instance, or null if not ready. */
    @Nullable
    static YouTubePlayer getCurrentPlayer() {
        if (currentInstance != null) {
            return currentInstance.youTubePlayer;
        }
        return null;
    }

    @Nullable
    static String getCurrentPlayerId() {
        if (currentInstance != null) {
            return currentInstance.playerId;
        }
        return null;
    }

    static boolean matchesPlayerId(@Nullable String playerId) {
        return playerId != null && playerId.equals(getCurrentPlayerId());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        currentInstance = this;

        videoId = getIntent().getStringExtra("videoId");
        playerId = getIntent().getStringExtra("playerId");
        boolean startFullscreen = getIntent().getBooleanExtra("fullscreen", true);

        Log.d(TAG, "Creating player for videoId: " + videoId + ", playerId: " + playerId + ", fullscreen: " + startFullscreen);

        if (startFullscreen) {
            enterFullscreen();
        }

        youTubePlayerView = new YouTubePlayerView(this);
        setContentView(youTubePlayerView);
        getLifecycle().addObserver(youTubePlayerView);

        IFramePlayerOptions iFramePlayerOptions = new IFramePlayerOptions.Builder().controls(1).fullscreen(1).build();

        youTubePlayerView.initialize(
            new AbstractYouTubePlayerListener() {
                @Override
                public void onReady(@NonNull YouTubePlayer player) {
                    youTubePlayer = player;
                    Log.d(TAG, "Player ready, loading video: " + videoId);

                    JSObject result = new JSObject();
                    result.put("message", "Youtube Player View initialized.");
                    RxBus.publish(result);

                    player.loadVideo(videoId, 0f);
                }

                @Override
                public void onStateChange(@NonNull YouTubePlayer player, @NonNull PlayerConstants.PlayerState state) {
                    Log.d(TAG, "Player state changed: " + state.name());
                    if (state == PlayerConstants.PlayerState.ENDED) {
                        finish();
                    }
                }

                @Override
                public void onError(@NonNull YouTubePlayer player, @NonNull PlayerConstants.PlayerError error) {
                    Log.e(TAG, "Player error: " + error.name());
                }
            },
            iFramePlayerOptions
        );
    }

    private void enterFullscreen() {
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow()
            .getDecorView()
            .setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (currentInstance == this) {
            currentInstance = null;
        }
        RxBus.publish(new ActivityDestroyedSignal());
        if (youTubePlayerView != null) {
            youTubePlayerView.release();
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
    }

    /** Marker published when the fullscreen activity is destroyed. */
    static final class ActivityDestroyedSignal {}
}
