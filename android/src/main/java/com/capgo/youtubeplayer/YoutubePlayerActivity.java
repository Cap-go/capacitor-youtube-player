package com.capgo.youtubeplayer;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Get video ID from intent
        videoId = getIntent().getStringExtra("videoId");
        String playerId = getIntent().getStringExtra("playerId");
        boolean startFullscreen = getIntent().getBooleanExtra("fullscreen", true);

        Log.d(TAG, "Creating player for videoId: " + videoId + ", fullscreen: " + startFullscreen);

        // Set fullscreen
        if (startFullscreen) {
            enterFullscreen();
        }

        // Create YouTubePlayerView
        youTubePlayerView = new YouTubePlayerView(this);
        setContentView(youTubePlayerView);

        // Initialize player
        getLifecycle().addObserver(youTubePlayerView);

        // Build IFrame player options
        IFramePlayerOptions iFramePlayerOptions = new IFramePlayerOptions.Builder()
            .controls(1)  // Show controls
            .fullscreen(1) // Enable fullscreen button
            .build();

        youTubePlayerView.initialize(new AbstractYouTubePlayerListener() {
            @Override
            public void onReady(@NonNull YouTubePlayer player) {
                youTubePlayer = player;
                Log.d(TAG, "Player ready, loading video: " + videoId);

                // Load the video
                player.loadVideo(videoId, 0f);
            }

            @Override
            public void onStateChange(@NonNull YouTubePlayer player, @NonNull PlayerConstants.PlayerState state) {
                Log.d(TAG, "Player state changed: " + state.name());

                // Close activity when video ends
                if (state == PlayerConstants.PlayerState.ENDED) {
                    finish();
                }
            }

            @Override
            public void onError(@NonNull YouTubePlayer player, @NonNull PlayerConstants.PlayerError error) {
                Log.e(TAG, "Player error: " + error.name());
            }
        }, iFramePlayerOptions);
    }

    private void enterFullscreen() {
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().getDecorView().setSystemUiVisibility(
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
        if (youTubePlayerView != null) {
            youTubePlayerView.release();
        }
    }

    @Override
    public void onBackPressed() {
        // Just close the activity
        super.onBackPressed();
    }
}
