package com.capgo.youtubeplayer;

final class YoutubePlayerHtmlBuilder {

    private YoutubePlayerHtmlBuilder() {}

    static String build(String videoId, String playerId, String playerVarsJson, String origin) {
        String escapedVideoId = escapeJs(videoId);
        String escapedPlayerId = escapeJs(playerId);
        String escapedOrigin = escapeJs(origin);
        return (
            "<!DOCTYPE html><html><head>" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">" +
            "<style>html,body{margin:0;padding:0;width:100%;height:100%;background:#000;overflow:hidden}#player{width:100%;height:100%}</style>" +
            "</head><body><div id=\"player\"></div>" +
            "<script src=\"https://www.youtube.com/iframe_api\"></script><script>" +
            "var player,timeUpdateInterval,playerId='" +
            escapedPlayerId +
            "';" +
            "function postEvent(type,data){var payload=data||{};payload.playerId=playerId;if(window.CapgoYoutubePlayerBridge){window.CapgoYoutubePlayerBridge.postEvent(type,JSON.stringify(payload));}}" +
            "function startTimeUpdates(){stopTimeUpdates();timeUpdateInterval=setInterval(function(){if(player&&player.getCurrentTime){postEvent('currentTimeChange',{currentTime:player.getCurrentTime()});}},250);}" +
            "function stopTimeUpdates(){if(timeUpdateInterval){clearInterval(timeUpdateInterval);timeUpdateInterval=null;}}" +
            "function onYouTubeIframeAPIReady(){var vars=" +
            playerVarsJson +
            ";if(!vars.origin){vars.origin='" +
            escapedOrigin +
            "';}player=new YT.Player('player',{videoId:'" +
            escapedVideoId +
            "',playerVars:vars,events:{'onReady':function(){window.playerReady=true;postEvent('playerReady',{});},'onStateChange':function(e){postEvent('playerStateChange',{state:e.data});if(e.data===YT.PlayerState.PLAYING){startTimeUpdates();}else{stopTimeUpdates();}},'onError':function(e){postEvent('playerError',{code:e.data});},'onPlaybackRateChange':function(e){postEvent('playbackRateChange',{playbackRate:e.data});}}});}" +
            "function executePlayerCommand(command){var args=Array.prototype.slice.call(arguments,1);try{if(!window.playerReady||!player){return JSON.stringify({success:false,error:'Player not ready'});}var result=player[command].apply(player,args);return JSON.stringify({success:true,value:result});}catch(error){return JSON.stringify({success:false,error:error.message});}}" +
            "</script></body></html>"
        );
    }

    private static String escapeJs(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("'", "\\'").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
