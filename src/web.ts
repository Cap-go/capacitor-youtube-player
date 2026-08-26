import { WebPlugin } from '@capacitor/core';

import type {
  CreatePlayerOptions,
  IPlayerFrame,
  PlayerEventListenerOptions,
  PlayerIdOptions,
  PlayVideoAtOptions,
  PlaylistMethodOptions,
  SeekToOptions,
  SetLoopOptions,
  SetPlaybackQualityOptions,
  SetPlaybackRateOptions,
  SetPlayerFrameOptions,
  SetShuffleOptions,
  SetSizeOptions,
  SetVolumeOptions,
  ToggleFullScreenOptions,
  VideoByIdMethodOptions,
  VideoByUrlMethodOptions,
  YoutubePlayerPlugin,
} from './definitions';
import { Log } from './log';
import { MIN_PLAYER_DIMENSION, validatePlayerFrame, validatePlayerSize } from './validation';
import type {
  IPlayerSize,
  IPlayerState,
  IPlayerOptions,
  RequiredKeys,
  IPlaybackQuality,
  IVideoOptionsById,
  IVideoOptionsByUrl,
  PlayerEvent,
} from './web/models/models';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function YT() {
  return (window as any)['YT'];
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function Player() {
  return YT().Player;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function PlayerState() {
  return YT().PlayerState;
}

export class YoutubePlayerPluginWeb extends WebPlugin implements YoutubePlayerPlugin {
  players: any = [];
  playersEventsState = new Map<string, IPlayerState>();
  player: any;
  playerApiLoaded = false;
  private currentTimeIntervals = new Map<string, ReturnType<typeof setInterval>>();
  private fullscreenListeners = new Map<string, () => void>();
  private playerMountElements = new Map<string, HTMLElement>();
  private visibilityListenerRegistered = false;
  private readonly defaultSizes: IPlayerSize = {
    height: 270,
    width: 367,
  };
  playerLogger: any;

  constructor() {
    super();
  }

  setCookies(cookies: string): void {
    this.playerLogger.log('setCookies', { cookies });
    try {
      // Parse and set cookies for the YouTube domain
      const cookiePairs = cookies.split(';').map((c) => c.trim());
      cookiePairs.forEach((pair) => {
        if (pair) {
          // Set cookie with appropriate domain for YouTube
          // Note: This sets cookies for the current domain. For cross-domain cookies,
          // the user must handle this at a higher level (e.g., through their backend)
          document.cookie = pair + '; path=/; SameSite=None; Secure';
          this.playerLogger.log('Cookie set:', pair);
        }
      });
    } catch (error) {
      this.playerLogger.error('Error setting cookies:', error);
    }
  }

  async loadPlayerApi(privacyEnhanced = false): Promise<boolean> {
    this.playerLogger.log('loadPlayerApi', { privacyEnhanced });
    return await new Promise((resolve) => {
      (window as any).onYouTubeIframeAPIReady = () => {
        this.playerLogger.log('onYouTubeIframeAPIReady');
        this.playerApiLoaded = true;
        resolve(true);
      };

      // This code loads the IFrame Player API code asynchronously.
      const tag = document.createElement('script');
      tag.type = 'text/javascript';
      // Use privacy-enhanced domain if requested (youtube-nocookie.com for GDPR compliance)
      tag.src = privacyEnhanced ? 'https://www.youtube-nocookie.com/iframe_api' : 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    });
  }

  checkSize(options: IPlayerOptions, enforceMinimum = false): IPlayerSize {
    const playerSize = {
      height: options.playerSize.height || this.defaultSizes.height,
      width: options.playerSize.width || this.defaultSizes.width,
    };
    if (enforceMinimum) {
      validatePlayerSize(playerSize.width, playerSize.height);
      playerSize.width = Math.max(MIN_PLAYER_DIMENSION, Math.min(playerSize.width, window.innerWidth));
      playerSize.height = Math.max(MIN_PLAYER_DIMENSION, Math.min(playerSize.height, window.innerHeight));
    } else {
      if (playerSize.height > window.innerHeight) playerSize.height = window.innerHeight;
      if (playerSize.width > window.innerWidth) playerSize.width = window.innerWidth;
    }

    return playerSize;
  }

  private getMountElementId(options: IPlayerOptions & { playerId: string }): string {
    return options.elementId ?? options.playerId;
  }

  private ensureOrigin(playerVars: Record<string, unknown> = {}): Record<string, unknown> {
    if (!playerVars.origin) {
      playerVars.origin = window.location.origin;
    }
    return playerVars;
  }

  private emitPlayerEvent(eventName: string, data: Record<string, unknown>): void {
    void this.notifyListeners(eventName, data);
  }

  private startCurrentTimeUpdates(playerId: string, player: { getCurrentTime: () => number }): void {
    this.stopCurrentTimeUpdates(playerId);
    const interval = setInterval(() => {
      try {
        const currentTime = player.getCurrentTime();
        this.emitPlayerEvent('currentTimeChange', { playerId, currentTime });
      } catch {
        // Player may have been destroyed.
      }
    }, 250);
    this.currentTimeIntervals.set(playerId, interval);
  }

  private stopCurrentTimeUpdates(playerId: string): void {
    const interval = this.currentTimeIntervals.get(playerId);
    if (interval) {
      clearInterval(interval);
      this.currentTimeIntervals.delete(playerId);
    }
  }

  private registerBackgroundPause(): void {
    if (this.visibilityListenerRegistered || typeof document === 'undefined') {
      return;
    }
    this.visibilityListenerRegistered = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        Object.keys(this.players).forEach((playerId) => {
          try {
            this.players[playerId]?.pauseVideo?.();
          } catch {
            // ignore
          }
        });
      }
    });
  }

  private bindFullscreenListener(playerId: string, mountElement: HTMLElement | null): void {
    this.unbindFullscreenListener(playerId);
    if (!mountElement) {
      return;
    }
    const onFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === mountElement;
      this.emitPlayerEvent('fullscreenChange', { playerId, isFullscreen });
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    this.fullscreenListeners.set(playerId, onFullscreenChange);
    this.playerMountElements.set(playerId, mountElement);
  }

  private unbindFullscreenListener(playerId: string): void {
    const listener = this.fullscreenListeners.get(playerId);
    if (listener) {
      document.removeEventListener('fullscreenchange', listener);
      this.fullscreenListeners.delete(playerId);
    }
    this.playerMountElements.delete(playerId);
  }

  async createPlayer(options: CreatePlayerOptions): Promise<{ playerReady: boolean; player: string } | undefined> {
    validatePlayerFrame(options.playerFrame);
    return this.initialize(options);
  }

  async setPlayerFrame({
    playerId,
    x,
    y,
    width,
    height,
  }: SetPlayerFrameOptions): Promise<{ result: { method: string; value: IPlayerFrame } }> {
    const frame = { x, y, width, height };
    validatePlayerFrame(frame);
    this.playerLogger?.log(`player "${playerId}" -> setPlayerFrame (web no-op)`, frame);
    return Promise.resolve({ result: { method: 'setPlayerFrame', value: frame } });
  }

  // This function creates an <iframe> (and YouTube player)
  // after the API code downloads.
  async createPlayerInstance(
    options: RequiredKeys<IPlayerOptions, 'playerId'>,
  ): Promise<{ playerReady: boolean; player: string }> {
    this.playerLogger.log('createPlayer');
    const playerSize = this.checkSize(options, Boolean(options.playerFrame));
    const mountId = this.getMountElementId(options);
    const playerVars = this.ensureOrigin({ ...(options.playerVars ?? {}) });

    return await new Promise((resolve) => {
      const player = Player();

      this.players[options.playerId] = new player(mountId, {
        playerVars,
        ...playerSize,
        fullscreen: options.fullscreen,
        videoId: options.videoId,
        events: {
          // The API will call this function when the video player is ready.
          onReady: (event: any) => {
            this.playerLogger.log(`player "${options.playerId}" -> onPlayerReady`);
            const state: IPlayerState = { events: { onReady: { text: 'onReady', value: true } } };
            this.playersEventsState.set(options.playerId, state);
            this.emitPlayerEvent('playerReady', { playerId: options.playerId });
            const mountElement = document.getElementById(mountId);
            this.bindFullscreenListener(options.playerId, mountElement);
            if (options?.playerVars?.autoplay === 1) {
              event.target.mute();
              event.target.playVideo();
            }
            return resolve({ playerReady: true, player: options.playerId });
          },
          onStateChange: (event: any) => {
            this.playerLogger.log(`player "${options.playerId}" -> onPlayerStateChange`);
            this.emitPlayerEvent('playerStateChange', { playerId: options.playerId, state: event.data });
            switch (event.data) {
              case PlayerState().PLAYING:
                this.playerLogger.log(`player "${options.playerId}" -> playing`);
                this.playersEventsState.get(options.playerId)!.events.onStateChange = {
                  text: 'playing',
                  value: PlayerState().PLAYING,
                };
                this.startCurrentTimeUpdates(options.playerId, event.target);
                if (options.fullscreen) {
                  const mountElement = this.playerMountElements.get(options.playerId);
                  mountElement?.requestFullscreen?.();
                }
                break;
              case PlayerState().PAUSED:
                this.playerLogger.log(`player "${options.playerId}" -> paused`);
                this.stopCurrentTimeUpdates(options.playerId);
                this.playersEventsState.get(options.playerId)!.events.onStateChange = {
                  text: 'paused',
                  value: PlayerState().PAUSED,
                };
                break;
              case PlayerState().ENDED:
                this.playerLogger.log(`player "${options.playerId}" -> ended`);
                this.stopCurrentTimeUpdates(options.playerId);
                this.playersEventsState.get(options.playerId)!.events.onStateChange = {
                  text: 'ended',
                  value: PlayerState().ENDED,
                };
                break;
              case PlayerState().BUFFERING:
                this.playerLogger.log(`player "${options.playerId}" -> buffering`);
                this.playersEventsState.get(options.playerId)!.events.onStateChange = {
                  text: 'buffering',
                  value: PlayerState().BUFFERING,
                };
                break;
              case PlayerState().CUED:
                this.playerLogger.log(`player "${options.playerId}" -> cued`);
                this.playersEventsState.get(options.playerId)!.events.onStateChange = {
                  text: 'cued',
                  value: PlayerState().CUED,
                };
                break;
            }
          },
          onPlaybackQualityChange: (event: any) => {
            this.playerLogger.log(
              `player "${options.playerId}" -> onPlayerPlaybackQualityChange quality ${event.data}`,
            );
            this.playersEventsState.get(options.playerId)!.events.onPlaybackQualityChange = {
              text: 'onPlaybackQualityChange',
              value: event.data,
            };
          },
          onPlaybackRateChange: (event: any) => {
            this.emitPlayerEvent('playbackRateChange', {
              playerId: options.playerId,
              playbackRate: event.data,
            });
          },
          onError: (error: any) => {
            this.playerLogger.error(`player "${options.playerId}" -> onPlayerError`, { error: error });
            this.playersEventsState.get(options.playerId)!.events.onError = { text: 'onError', value: error };
            this.emitPlayerEvent('playerError', { playerId: options.playerId, code: error?.data ?? error });
          },
        },
      });
    });
  }

  async initialize(
    options: RequiredKeys<IPlayerOptions, 'playerId'>,
  ): Promise<{ playerReady: boolean; player: string } | undefined> {
    this.playerLogger = new Log(options.debug);
    this.playerLogger.log('initialize', { privacyEnhanced: options.privacyEnhanced, cookies: options.cookies });
    this.registerBackgroundPause();

    if (options.playerFrame) {
      validatePlayerFrame(options.playerFrame);
    }

    // Set cookies before loading the player if provided
    if (options.cookies) {
      this.setCookies(options.cookies);
    }

    if (!this.playerApiLoaded) {
      const result = await this.loadPlayerApi(options.privacyEnhanced || false);
      this.playerLogger.log('loadPlayerApi result', { result: result });
    }
    if (this.playerApiLoaded) {
      const playerReady: { playerReady: boolean; player: string } = (await this.createPlayerInstance(options)) as {
        playerReady: boolean;
        player: string;
      };
      this.playerLogger.log('loadPlayerApi initialize completed', { playerReady: playerReady });
      return Promise.resolve(playerReady);
    }
  }

  async destroy({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> destroy`);
    this.stopCurrentTimeUpdates(playerId);
    this.unbindFullscreenListener(playerId);
    this.players[playerId].destroy();
    return Promise.resolve({ result: { method: 'destroy', value: true } });
  }

  // Methods playback controls and player settings.

  /*********/

  // Stops and cancels loading of the current video. This function should be reserved for rare situations when you know that the user will not be watching
  // additional video in the player. If your intent is to pause the video, you should just call the pauseVideo function. If you want to change the video
  // that the player is playing, you can call one of the queueing functions without calling stopVideo first.
  async stopVideo({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" ->  stopVideo`);
    this.players[playerId].stopVideo();
    return Promise.resolve({ result: { method: 'stopVideo', value: true } });
  }

  // Plays the currently cued/loaded video. The final player state after this function executes will be playing (1).
  async playVideo({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> playVideo`);
    this.players[playerId].playVideo();
    return Promise.resolve({ result: { method: 'playVideo', value: true } });
  }

  // Pauses the currently playing video. The final player state after this function executes will be paused (2) unless the player is in the ended (0)
  // state when the function is called, in which case the player state will not change.
  async pauseVideo({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> pauseVideo`);
    this.players[playerId].pauseVideo();
    return Promise.resolve({ result: { method: 'pauseVideo', value: true } });
  }

  // Seeks to a specified time in the video. If the player is paused when the function is called, it will remain paused. If the function is called from
  // another state (playing, video cued, etc.), the player will play the video.
  async seekTo({
    playerId,
    seconds,
    allowSeekAhead,
  }: SeekToOptions): Promise<{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> seekTo ${seconds} seconds`);
    this.players[playerId].seekTo(seconds, allowSeekAhead);
    return Promise.resolve({
      result: { method: 'seekTo', value: true, seconds: seconds, allowSeekAhead: allowSeekAhead },
    });
  }

  // Loads and plays the specified video.
  async loadVideoById({
    playerId,
    options,
  }: VideoByIdMethodOptions): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById } }> {
    this.playerLogger.log(`player "${playerId}" -> loadVideoById with options ${options}`);
    this.players[playerId].loadVideoById(options);
    return Promise.resolve({ result: { method: 'loadVideoById', value: true, options: options } });
  }

  // Loads the specified video's thumbnail and prepares the player to play the video. The player does not request the FLV until playVideo() or seekTo() is called.
  async cueVideoById({
    playerId,
    options,
  }: VideoByIdMethodOptions): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById } }> {
    this.playerLogger.log(`player "${playerId}" -> cueVideoById with options ${options}`);
    this.players[playerId].cueVideoById(options);
    return Promise.resolve({ result: { method: 'cueVideoById', value: true, options: options } });
  }

  async loadVideoByUrl({
    playerId,
    options,
  }: VideoByUrlMethodOptions): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl } }> {
    this.playerLogger.log(`player "${playerId}" -> loadVideoByUrl with options ${options}`);
    this.players[playerId].loadVideoByUrl(options);
    return Promise.resolve({ result: { method: 'loadVideoByUrl', value: true, options: options } });
  }

  async cueVideoByUrl({
    playerId,
    options,
  }: VideoByUrlMethodOptions): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl } }> {
    this.playerLogger.log(`player "${playerId}" -> cueVideoByUrl with options ${options}`);
    this.players[playerId].cueVideoByUrl(options);
    return Promise.resolve({ result: { method: 'cueVideoByUrl', value: true, options: options } });
  }

  /*********/

  // Methods for playing playlist.

  /*********/

  async cuePlaylist({
    playerId,
    playlistOptions,
  }: PlaylistMethodOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> cuePlaylist with options ${JSON.stringify(playlistOptions)}`);
    this.players[playerId].cuePlaylist(playlistOptions);
    return Promise.resolve({ result: { method: 'cuePlaylist', value: true } });
  }

  async loadPlaylist({
    playerId,
    playlistOptions,
  }: PlaylistMethodOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> loadPlaylist with options ${playlistOptions}`);
    this.players[playerId].loadPlaylist(playlistOptions);
    return Promise.resolve({ result: { method: 'loadPlaylist', value: true } });
  }

  /*********/

  // Methods for playing video in playlist.

  /*********/

  async nextVideo({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> nextVideo`);
    this.players[playerId].nextVideo();
    return Promise.resolve({ result: { method: 'nextVideo', value: true } });
  }

  async previousVideo({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> previousVideo`);
    this.players[playerId].previousVideo();
    return Promise.resolve({ result: { method: 'previousVideo', value: true } });
  }

  async playVideoAt({ playerId, index }: PlayVideoAtOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> playVideoAt`);
    this.players[playerId].playVideoAt(index);
    return Promise.resolve({ result: { method: 'playVideoAt', value: true } });
  }

  /*********/

  // Methods for adjusting the playback speed.

  async getPlaybackRate({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getPlaybackRate`);
    return Promise.resolve({ result: { method: 'getPlaybackRate', value: this.players[playerId].getPlaybackRate() } });
  }

  async setPlaybackRate({
    playerId,
    suggestedRate,
  }: SetPlaybackRateOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> setPlaybackRate`);
    this.players[playerId].setPlaybackRate(suggestedRate);
    return Promise.resolve({ result: { method: 'setPlaybackRate', value: true } });
  }

  async getAvailablePlaybackRates({
    playerId,
  }: PlayerIdOptions): Promise<{ result: { method: string; value: number[] } }> {
    this.playerLogger.log(`player -> getAvailablePlaybackRates`);
    return Promise.resolve({
      result: { method: 'getAvailablePlaybackRates', value: this.players[playerId].getAvailablePlaybackRates() },
    });
  }

  /*********/

  /*********/

  // Methods for playlist playback settings

  /*********/

  async setLoop({ playerId, loopPlaylists }: SetLoopOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> setLoop`);
    this.players[playerId].setLoop(loopPlaylists);
    return Promise.resolve({ result: { method: 'setLoop', value: true } });
  }

  async setShuffle({
    playerId,
    shufflePlaylist,
  }: SetShuffleOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> setShuffle`);
    this.players[playerId].setShuffle(shufflePlaylist);
    return Promise.resolve({ result: { method: 'setShuffle', value: true } });
  }

  /*********/

  // Methods changing the player volume.

  /*********/

  // Mutes the player.
  async mute({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> mute`);
    this.players[playerId].mute();
    return Promise.resolve({ result: { method: 'mute', value: true } });
  }

  // Unmutes the player.
  async unMute({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> unMute`);
    this.players[playerId].unMute();
    return Promise.resolve({ result: { method: 'unMute', value: true } });
  }

  // Returns true if the player is muted, false if not.
  async isMuted({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> isMuted`);
    return Promise.resolve({ result: { method: 'isMuted', value: this.players[playerId].isMuted() } });
  }

  // Sets the volume. Accepts an integer between 0 and 100.
  async setVolume({ playerId, volume }: SetVolumeOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> setVolume ${volume}`);
    this.players[playerId].setVolume(volume);
    return Promise.resolve({ result: { method: 'setVolume', value: volume } });
  }

  // Returns the player's current volume, an integer between 0 and 100. Note that getVolume() will return the volume even if the player is muted.
  async getVolume({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getVolume`);
    return Promise.resolve({ result: { method: 'getVolume', value: this.players[playerId].getVolume() } });
  }

  /*********/

  // Methods setting the player size.

  /*********/

  // Sets the size in pixels of the <iframe> that contains the player.
  async setSize({
    playerId,
    width,
    height,
  }: SetSizeOptions): Promise<{ result: { method: string; value: IPlayerSize } }> {
    this.playerLogger.log(`player "${playerId}" -> setSize width: ${width} height: ${height}`);
    this.players[playerId].setSize(width, height);
    return Promise.resolve({ result: { method: 'setSize', value: { width: width, height: height } } });
  }

  /*********/

  // Methods playback status.

  /*********/

  // Returns a number between 0 and 1 that specifies the percentage of the video that the player shows as buffered.
  // This method returns a more reliable number than the now-deprecated getVideoBytesLoaded and getVideoBytesTotal methods.
  async getVideoLoadedFraction({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getVideoLoadedFraction`);
    return Promise.resolve({
      result: { method: 'getVideoLoadedFraction', value: this.players[playerId].getVideoLoadedFraction() },
    });
  }

  // Returns the state of the player. Possible values are:
  // -1 – unstarted
  // 0 – ended
  // 1 – playing
  // 2 – paused
  // 3 – buffering
  // 5 – video cued
  async getPlayerState({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getPlayerState`);
    return Promise.resolve({ result: { method: 'getPlayerState', value: this.players[playerId].getPlayerState() } });
  }

  async getAllPlayersEventsState(): Promise<{ result: { method: string; value: Map<string, IPlayerState> } }> {
    this.playerLogger.log('getAllPlayersEventsState');
    return Promise.resolve({ result: { method: 'getAllPlayersEventsState', value: this.playersEventsState } });
  }

  // Returns the elapsed time in seconds since the video started playing.
  async getCurrentTime({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getCurrentTime`);
    return Promise.resolve({ result: { method: 'getCurrentTime', value: this.players[playerId].getCurrentTime() } });
  }

  async toggleFullScreen({
    playerId,
    isFullScreen,
  }: ToggleFullScreenOptions): Promise<{ result: { method: string; value: boolean | null | undefined } }> {
    this.playerLogger.log(`player "${playerId}" -> toggleFullScreen`);
    let { height, width } = this.defaultSizes;

    if (!isFullScreen) {
      height = window.innerHeight;
      width = window.innerWidth;
    }

    this.players[playerId].setSize(width, height);
    const mountElement = this.playerMountElements.get(playerId);
    if (mountElement) {
      if (isFullScreen) {
        await mountElement.requestFullscreen?.();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    }
    return Promise.resolve({ result: { method: 'toggleFullScreen', value: isFullScreen } });
  }

  /*********/

  // Methods playback quality.

  /*********/

  async getPlaybackQuality({
    playerId,
  }: PlayerIdOptions): Promise<{ result: { method: string; value: IPlaybackQuality } }> {
    this.playerLogger.log(`player "${playerId}" -> getPlaybackQuality`);
    return Promise.resolve({
      result: { method: 'getPlaybackQuality', value: this.players[playerId].getPlaybackQuality() },
    });
  }

  async setPlaybackQuality({
    playerId,
    suggestedQuality,
  }: SetPlaybackQualityOptions): Promise<{ result: { method: string; value: boolean } }> {
    this.playerLogger.log(`player "${playerId}" -> setPlaybackQuality`);
    this.players[playerId].setPlaybackQuality(suggestedQuality);
    return Promise.resolve({ result: { method: 'setPlaybackQuality', value: true } });
  }

  async getAvailableQualityLevels({
    playerId,
  }: PlayerIdOptions): Promise<{ result: { method: string; value: IPlaybackQuality[] } }> {
    this.playerLogger.log(`player "${playerId}" -> getAvailableQualityLevels`);
    return Promise.resolve({
      result: { method: 'getAvailableQualityLevels', value: this.players[playerId].getAvailableQualityLevels() },
    });
  }

  /*********/

  // Methods for retrieving video information.

  /*********/

  async getDuration({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getDuration`);
    return Promise.resolve({ result: { method: 'getDuration', value: this.players[playerId].getDuration() } });
  }

  async getVideoUrl({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: string } }> {
    this.playerLogger.log(`player "${playerId}" -> getVideoUrl`);
    return Promise.resolve({ result: { method: 'getVideoUrl', value: this.players[playerId].getVideoUrl() } });
  }

  async getVideoEmbedCode({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: string } }> {
    this.playerLogger.log(`player "${playerId}" -> getVideoEmbedCode`);
    return Promise.resolve({
      result: { method: 'getVideoEmbedCode', value: this.players[playerId].getVideoEmbedCode() },
    });
  }

  /*********/

  // Methods for retrieving playlist information.

  /*********/

  async getPlaylist({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: string[] } }> {
    this.playerLogger.log(`player "${playerId}" -> getPlaylist`);
    return Promise.resolve({ result: { method: 'getPlaylist', value: this.players[playerId].getPlaylist() } });
  }

  async getPlaylistIndex({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: number } }> {
    this.playerLogger.log(`player "${playerId}" -> getPlaylistIndex`);
    return Promise.resolve({
      result: { method: 'getPlaylistIndex', value: this.players[playerId].getPlaylistIndex() },
    });
  }

  /*********/

  // Methods accessing and modifying DOM nodes.

  /*********/

  async getIframe({ playerId }: PlayerIdOptions): Promise<{ result: { method: string; value: HTMLIFrameElement } }> {
    this.playerLogger.log(`player "${playerId}" -> getIframe`);
    return Promise.resolve({ result: { method: 'getIframe', value: this.players[playerId].getIframe() } });
  }

  /*********/

  // Player event listeners.

  addEventListener<TEvent extends PlayerEvent>({
    playerId,
    eventName,
    listener,
  }: PlayerEventListenerOptions<TEvent>): void {
    this.playerLogger.log(`player "${playerId}" -> addEventListener "${eventName}"`);
    this.players[playerId].addEventListener(eventName, listener);
  }

  removeEventListener<TEvent extends PlayerEvent>({
    playerId,
    eventName,
    listener,
  }: PlayerEventListenerOptions<TEvent>): void {
    this.playerLogger.log(`player "${playerId}" -> removeEventListener "${eventName}"`);
    this.players[playerId].removeEventListener(eventName, listener);
  }

  /*********/

  async getPluginVersion(): Promise<{ version: string }> {
    return { version: 'web' };
  }
}
