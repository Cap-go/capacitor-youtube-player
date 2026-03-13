package com.capgo.youtubeplayer;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import com.getcapacitor.JSObject;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.PlayerConstants;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.listeners.AbstractYouTubePlayerListener;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.options.IFramePlayerOptions;
import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.views.YouTubePlayerView;

public class YoutubePlayerFragment extends AppCompatActivity {

    private static final String TAG = YoutubePlayerFragment.class.getSimpleName();

    private YouTubePlayerView youTubePlayerView;
    private YouTubePlayer youTubePlayer;

    private boolean fullscreen = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.e(TAG, "[Youtube Player Fragment]: onCreate");

        String videoId = "";
        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            videoId = extras.getString("videoId");
            fullscreen = extras.getBoolean("fullscreen");
        }

        if (fullscreen) {
            enterFullscreen();
        }

        youTubePlayerView = new YouTubePlayerView(this);
        setContentView(youTubePlayerView);
        getLifecycle().addObserver(youTubePlayerView);

        IFramePlayerOptions iFramePlayerOptions = new IFramePlayerOptions.Builder()
            .controls(1)
            .fullscreen(1)
            .build();

        final String finalVideoId = videoId;
        youTubePlayerView.initialize(
            new AbstractYouTubePlayerListener() {
                @Override
                public void onReady(@NonNull YouTubePlayer player) {
                    youTubePlayer = player;
                    Log.e(TAG, "[Youtube Player Fragment]: Player ready, loading video: " + finalVideoId);

                    JSObject result = new JSObject();
                    result.put("message", "Youtube Player View initialized.");
                    RxBus.publish(result);

                    player.loadVideo(finalVideoId, 0f);
                }

                @Override
                public void onStateChange(@NonNull YouTubePlayer player, @NonNull PlayerConstants.PlayerState state) {
                    Log.d(TAG, "[Youtube Player Fragment]: state changed: " + state.name());
                    if (state == PlayerConstants.PlayerState.ENDED) {
                        finish();
                    }
                }

                @Override
                public void onError(@NonNull YouTubePlayer player, @NonNull PlayerConstants.PlayerError error) {
                    Log.e(TAG, "[Youtube Player Fragment]: Player error: " + error.name());
                    RxBus.publish("Youtube Player View initialization failed");
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
        if (youTubePlayerView != null) {
            youTubePlayerView.release();
        }
    }
}
