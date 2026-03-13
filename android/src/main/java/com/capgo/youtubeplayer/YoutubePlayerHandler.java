package com.capgo.youtubeplayer;

import com.pierfrancescosoffritti.androidyoutubeplayer.core.player.YouTubePlayer;

public class YoutubePlayerHandler {

    // Methods playing video.
    /***********/

    public void playVideo(YouTubePlayer youTubePlayer) {
        youTubePlayer.play();
    }

    public void pauseVideo(YouTubePlayer youTubePlayer) {
        youTubePlayer.pause();
    }

    public void seekTo(YouTubePlayer youTubePlayer, float seconds) {
        youTubePlayer.seekTo(seconds);
    }

    public void cueVideoById(YouTubePlayer youTubePlayer, String videoId) {
        youTubePlayer.cueVideo(videoId, 0f);
    }

    public void loadVideoById(YouTubePlayer youTubePlayer, String videoId) {
        youTubePlayer.loadVideo(videoId, 0f);
    }
}
