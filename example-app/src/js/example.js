import { YoutubePlayer } from '@capgo/youtube-player';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    YoutubePlayer.echo({ value: inputValue })
}
