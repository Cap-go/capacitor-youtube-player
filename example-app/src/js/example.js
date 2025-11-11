import { YoutubePlayer } from '@capgo/capacitor-youtube-player';

const PLAYER_ID = 'yt-player';

const ui = {
  videoId: document.getElementById('videoId'),
  width: document.getElementById('playerWidth'),
  height: document.getElementById('playerHeight'),
  autoplay: document.getElementById('autoplay'),
  loop: document.getElementById('loopPlaylist'),
  init: document.getElementById('initButton'),
  destroy: document.getElementById('destroyButton'),
  status: document.getElementById('statusText'),
  section: document.getElementById('playerSection'),
  play: document.getElementById('playButton'),
  pause: document.getElementById('pauseButton'),
  stop: document.getElementById('stopButton'),
  fullscreen: document.getElementById('toggleFullscreenButton'),
  seekSeconds: document.getElementById('seekSeconds'),
  allowSeekAhead: document.getElementById('allowSeekAhead'),
  seek: document.getElementById('seekButton'),
  playbackRate: document.getElementById('playbackRate'),
  setRate: document.getElementById('setRateButton'),
  volume: document.getElementById('volume'),
  mute: document.getElementById('muteButton'),
  unmute: document.getElementById('unmuteButton'),
  refreshInfo: document.getElementById('refreshInfoButton'),
  newVideoId: document.getElementById('newVideoId'),
  loadVideo: document.getElementById('loadVideoButton'),
  clearLog: document.getElementById('clearLogButton'),
  log: document.getElementById('logOutput'),
};

let playerReady = false;
let fullscreenActive = false;
const registeredEvents = [];

const formatDetails = (details) => {
  if (details === undefined) return '';
  if (details === null) return 'null';
  if (details instanceof Error) return `${details.message}\n${details.stack ?? ''}`;
  if (typeof details === 'object') {
    try {
      return JSON.stringify(details, null, 2);
    } catch (err) {
      return String(details);
    }
  }
  return String(details);
};

const log = (message, details) => {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[1].replace('Z', '');
  const detailText = details !== undefined ? `\n${formatDetails(details)}` : '';
  const entry = `[${timestamp}] ${message}${detailText}`;

  if (ui.log.textContent.startsWith('Logs will appear here.')) {
    ui.log.textContent = entry;
  } else {
    ui.log.textContent = `${entry}\n\n${ui.log.textContent}`;
  }
  // Also mirror to console for easier debugging inside devtools.
  if (details !== undefined) {
    console.log(message, details); // eslint-disable-line no-console
  } else {
    console.log(message); // eslint-disable-line no-console
  }
};

const setStatus = (text) => {
  ui.status.textContent = `Status: ${text}`;
};

const toggleControls = (enabled) => {
  ui.destroy.disabled = !enabled;
  ui.section.hidden = !enabled;
  const toggle = (el) => {
    if (!el) return;
    el.disabled = !enabled;
  };

  [
    ui.play,
    ui.pause,
    ui.stop,
    ui.fullscreen,
    ui.seek,
    ui.seekSeconds,
    ui.allowSeekAhead,
    ui.setRate,
    ui.playbackRate,
    ui.volume,
    ui.mute,
    ui.unmute,
    ui.refreshInfo,
    ui.newVideoId,
    ui.loadVideo,
  ].forEach(toggle);
};

const removePlayerListeners = () => {
  while (registeredEvents.length > 0) {
    const { eventName, handler } = registeredEvents.pop();
    try {
      YoutubePlayer.removeEventListener(PLAYER_ID, eventName, handler);
    } catch (err) {
      log(`Failed to remove listener ${eventName}`, err);
    }
  }
};

const registerPlayerListeners = () => {
  removePlayerListeners();

  const addListener = (eventName) => {
    const handler = (event) => {
      log(`Event: ${eventName}`, {
        data: event?.data ?? null,
        target: event?.target ? event.target.id ?? 'unknown-target' : null,
      });
      if (eventName === 'onStateChange' && event?.data !== undefined) {
        setStatus(`state changed (${event.data})`);
      }
    };
    YoutubePlayer.addEventListener(PLAYER_ID, eventName, handler);
    registeredEvents.push({ eventName, handler });
  };

  ['onReady', 'onStateChange', 'onPlaybackQualityChange', 'onError'].forEach(addListener);
};

const parseNumber = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ensurePlayerReady = (action) => {
  if (!playerReady) {
    log(`Cannot ${action} before initialising the player.`);
    return false;
  }
  return true;
};

const initializePlayer = async () => {
  if (playerReady) {
    await destroyPlayer();
  }

  const videoId = ui.videoId.value.trim();
  if (videoId.length === 0) {
    log('Please provide a YouTube video ID before initialising the player.');
    return;
  }

  const width = Math.max(160, parseNumber(ui.width.value, 640));
  const height = Math.max(120, parseNumber(ui.height.value, 360));
  const autoplay = ui.autoplay.checked ? 1 : 0;

  try {
    setStatus('initialising...');
    log('Initialising player', { videoId, width, height, autoplay });

    const result = await YoutubePlayer.initialize({
      playerId: PLAYER_ID,
      videoId,
      playerSize: { width, height },
      fullscreen: false,
      debug: true,
      playerVars: {
        autoplay,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
      },
    });

    if (!result?.playerReady) {
      setStatus('failed to initialise');
      log('Player initialisation did not report ready state.', result);
      return;
    }

    playerReady = true;
    fullscreenActive = false;
    registerPlayerListeners();
    toggleControls(true);
    setStatus('ready');
    log('Player initialised successfully.', result);

    if (ui.loop.checked) {
      try {
        await YoutubePlayer.setLoop(PLAYER_ID, true);
        log('Loop mode enabled for current player.');
      } catch (err) {
        log('Failed to enable loop mode', err);
      }
    }

    try {
      await YoutubePlayer.setVolume(PLAYER_ID, parseNumber(ui.volume.value, 75));
    } catch (err) {
      log('Unable to set initial volume', err);
    }
  } catch (error) {
    setStatus('error');
    log('Error while initialising player', error);
  }
};

const destroyPlayer = async () => {
  if (!playerReady) {
    log('Destroy skipped. Player is not initialised.');
    return;
  }

  try {
    removePlayerListeners();
    const result = await YoutubePlayer.destroy(PLAYER_ID);
    log('Player destroyed.', result);
  } catch (error) {
    log('Error while destroying player', error);
  } finally {
    playerReady = false;
    fullscreenActive = false;
    toggleControls(false);
    setStatus('not initialised');
  }
};

const playVideo = async () => {
  if (!ensurePlayerReady('play')) return;
  try {
    const result = await YoutubePlayer.playVideo(PLAYER_ID);
    log('Play command sent.', result);
  } catch (error) {
    log('Failed to play video', error);
  }
};

const pauseVideo = async () => {
  if (!ensurePlayerReady('pause')) return;
  try {
    const result = await YoutubePlayer.pauseVideo(PLAYER_ID);
    log('Pause command sent.', result);
  } catch (error) {
    log('Failed to pause video', error);
  }
};

const stopVideo = async () => {
  if (!ensurePlayerReady('stop')) return;
  try {
    const result = await YoutubePlayer.stopVideo(PLAYER_ID);
    log('Stop command sent.', result);
  } catch (error) {
    log('Failed to stop video', error);
  }
};

const toggleFullscreen = async () => {
  if (!ensurePlayerReady('toggle fullscreen')) return;
  try {
    const result = await YoutubePlayer.toggleFullScreen(PLAYER_ID, fullscreenActive);
    fullscreenActive = !fullscreenActive;
    log(`Fullscreen ${fullscreenActive ? 'disabled' : 'enabled'}.`, result);
  } catch (error) {
    log('Failed to toggle fullscreen mode', error);
  }
};

const seekTo = async () => {
  if (!ensurePlayerReady('seek')) return;
  const seconds = Math.max(0, parseNumber(ui.seekSeconds.value, 0));
  const allowSeekAhead = ui.allowSeekAhead.checked;
  try {
    const result = await YoutubePlayer.seekTo(PLAYER_ID, seconds, allowSeekAhead);
    log(`Sought to ${seconds}s (allowAhead=${allowSeekAhead}).`, result);
  } catch (error) {
    log('Failed to seek video', error);
  }
};

const applyPlaybackRate = async () => {
  if (!ensurePlayerReady('set playback rate')) return;
  const rate = parseNumber(ui.playbackRate.value, 1);
  try {
    const result = await YoutubePlayer.setPlaybackRate(PLAYER_ID, rate);
    log(`Playback rate set to ${rate}x.`, result);
  } catch (error) {
    log('Failed to change playback rate', error);
  }
};

const setVolume = async () => {
  if (!ensurePlayerReady('set volume')) return;
  const volume = Math.round(parseNumber(ui.volume.value, 75));
  try {
    const result = await YoutubePlayer.setVolume(PLAYER_ID, volume);
    log(`Volume updated to ${volume}.`, result);
  } catch (error) {
    log('Failed to update volume', error);
  }
};

const muteVideo = async () => {
  if (!ensurePlayerReady('mute')) return;
  try {
    const result = await YoutubePlayer.mute(PLAYER_ID);
    log('Mute requested.', result);
  } catch (error) {
    log('Failed to mute video', error);
  }
};

const unmuteVideo = async () => {
  if (!ensurePlayerReady('unmute')) return;
  try {
    const result = await YoutubePlayer.unMute(PLAYER_ID);
    log('Unmute requested.', result);
  } catch (error) {
    log('Failed to unmute video', error);
  }
};

const loadVideo = async () => {
  if (!ensurePlayerReady('load a new video')) return;
  const videoId = ui.newVideoId.value.trim();
  if (videoId.length === 0) {
    log('Provide a new video ID to load.');
    return;
  }

  try {
    const result = await YoutubePlayer.loadVideoById(PLAYER_ID, {
      videoId,
      startSeconds: 0,
    });
    log(`Requested video load for ${videoId}.`, result);
    setStatus(`loading ${videoId}`);
  } catch (error) {
    log('Failed to load new video', error);
  }
};

const refreshInfo = async () => {
  if (!ensurePlayerReady('query player state')) return;
  try {
    const [state, currentTime, duration, volume, muted, rate, quality, url] = await Promise.all([
      YoutubePlayer.getPlayerState(PLAYER_ID),
      YoutubePlayer.getCurrentTime(PLAYER_ID),
      YoutubePlayer.getDuration(PLAYER_ID),
      YoutubePlayer.getVolume(PLAYER_ID),
      YoutubePlayer.isMuted(PLAYER_ID),
      YoutubePlayer.getPlaybackRate(PLAYER_ID),
      YoutubePlayer.getPlaybackQuality(PLAYER_ID),
      YoutubePlayer.getVideoUrl(PLAYER_ID),
    ]);

    log('Playback information', {
      state: state?.result?.value ?? null,
      currentTime: currentTime?.result?.value ?? null,
      duration: duration?.result?.value ?? null,
      volume: volume?.result?.value ?? null,
      muted: muted?.result?.value ?? null,
      rate: rate?.result?.value ?? null,
      quality: quality?.result?.value ?? null,
      url: url?.result?.value ?? null,
    });
  } catch (error) {
    log('Failed to refresh playback information', error);
  }
};

ui.init.addEventListener('click', () => {
  initializePlayer().catch((error) => log('Unexpected error during init', error));
});
ui.destroy.addEventListener('click', () => {
  destroyPlayer().catch((error) => log('Unexpected error during destroy', error));
});
ui.play.addEventListener('click', () => {
  playVideo().catch((error) => log('Unexpected play error', error));
});
ui.pause.addEventListener('click', () => {
  pauseVideo().catch((error) => log('Unexpected pause error', error));
});
ui.stop.addEventListener('click', () => {
  stopVideo().catch((error) => log('Unexpected stop error', error));
});
ui.fullscreen.addEventListener('click', () => {
  toggleFullscreen().catch((error) => log('Unexpected fullscreen error', error));
});
ui.seek.addEventListener('click', () => {
  seekTo().catch((error) => log('Unexpected seek error', error));
});
ui.setRate.addEventListener('click', () => {
  applyPlaybackRate().catch((error) => log('Unexpected playback rate error', error));
});
ui.volume.addEventListener('change', () => {
  setVolume().catch((error) => log('Unexpected volume error', error));
});
ui.mute.addEventListener('click', () => {
  muteVideo().catch((error) => log('Unexpected mute error', error));
});
ui.unmute.addEventListener('click', () => {
  unmuteVideo().catch((error) => log('Unexpected unmute error', error));
});
ui.loadVideo.addEventListener('click', () => {
  loadVideo().catch((error) => log('Unexpected load error', error));
});
ui.refreshInfo.addEventListener('click', () => {
  refreshInfo().catch((error) => log('Unexpected refresh error', error));
});
ui.clearLog.addEventListener('click', () => {
  ui.log.textContent = 'Logs cleared.';
});

toggleControls(false);
setStatus('not initialised');
