import { Capacitor, registerPlugin } from '@capacitor/core';

import type {
  PlayerEventListenerOptions,
  PlayerIdOptions,
  PlayVideoAtOptions,
  PlaylistMethodOptions,
  SeekToOptions,
  SetLoopOptions,
  SetPlaybackQualityOptions,
  SetPlaybackRateOptions,
  SetShuffleOptions,
  SetSizeOptions,
  SetVolumeOptions,
  ToggleFullScreenOptions,
  VideoByIdMethodOptions,
  VideoByUrlMethodOptions,
  YoutubePlayerPlugin,
} from './definitions';
import type {
  Events,
  IPlaybackQuality,
  IPlaylistOptions,
  IVideoOptionsById,
  IVideoOptionsByUrl,
  PlayerEvent,
} from './web/models/models';

const YoutubePlayerNative = registerPlugin<YoutubePlayerPlugin>('YoutubePlayer', {
  web: () => import('./web').then((m) => new m.YoutubePlayerPluginWeb()),
});

const DEFAULT_WEB_PLAYER_SIZE = {
  width: 367,
  height: 270,
};

type YoutubePlayerLegacySignatures = {
  destroy(playerId: string): ReturnType<YoutubePlayerPlugin['destroy']>;
  stopVideo(playerId: string): ReturnType<YoutubePlayerPlugin['stopVideo']>;
  playVideo(playerId: string): ReturnType<YoutubePlayerPlugin['playVideo']>;
  pauseVideo(playerId: string): ReturnType<YoutubePlayerPlugin['pauseVideo']>;
  seekTo(playerId: string, seconds?: number, allowSeekAhead?: boolean): ReturnType<YoutubePlayerPlugin['seekTo']>;
  loadVideoById(playerId: string, options?: IVideoOptionsById): ReturnType<YoutubePlayerPlugin['loadVideoById']>;
  cueVideoById(playerId: string, options?: IVideoOptionsById): ReturnType<YoutubePlayerPlugin['cueVideoById']>;
  loadVideoByUrl(playerId: string, options?: IVideoOptionsByUrl): ReturnType<YoutubePlayerPlugin['loadVideoByUrl']>;
  cueVideoByUrl(playerId: string, options?: IVideoOptionsByUrl): ReturnType<YoutubePlayerPlugin['cueVideoByUrl']>;
  cuePlaylist(playerId: string, playlistOptions?: IPlaylistOptions): ReturnType<YoutubePlayerPlugin['cuePlaylist']>;
  loadPlaylist(playerId: string, playlistOptions?: IPlaylistOptions): ReturnType<YoutubePlayerPlugin['loadPlaylist']>;
  nextVideo(playerId: string): ReturnType<YoutubePlayerPlugin['nextVideo']>;
  previousVideo(playerId: string): ReturnType<YoutubePlayerPlugin['previousVideo']>;
  playVideoAt(playerId: string, index?: number): ReturnType<YoutubePlayerPlugin['playVideoAt']>;
  mute(playerId: string): ReturnType<YoutubePlayerPlugin['mute']>;
  unMute(playerId: string): ReturnType<YoutubePlayerPlugin['unMute']>;
  isMuted(playerId: string): ReturnType<YoutubePlayerPlugin['isMuted']>;
  setVolume(playerId: string, volume?: number): ReturnType<YoutubePlayerPlugin['setVolume']>;
  getVolume(playerId: string): ReturnType<YoutubePlayerPlugin['getVolume']>;
  setSize(playerId: string, width?: number, height?: number): ReturnType<YoutubePlayerPlugin['setSize']>;
  getPlaybackRate(playerId: string): ReturnType<YoutubePlayerPlugin['getPlaybackRate']>;
  setPlaybackRate(playerId: string, suggestedRate?: number): ReturnType<YoutubePlayerPlugin['setPlaybackRate']>;
  getAvailablePlaybackRates(playerId: string): ReturnType<YoutubePlayerPlugin['getAvailablePlaybackRates']>;
  setLoop(playerId: string, loopPlaylists?: boolean): ReturnType<YoutubePlayerPlugin['setLoop']>;
  setShuffle(playerId: string, shufflePlaylist?: boolean): ReturnType<YoutubePlayerPlugin['setShuffle']>;
  getVideoLoadedFraction(playerId: string): ReturnType<YoutubePlayerPlugin['getVideoLoadedFraction']>;
  getPlayerState(playerId: string): ReturnType<YoutubePlayerPlugin['getPlayerState']>;
  getCurrentTime(playerId: string): ReturnType<YoutubePlayerPlugin['getCurrentTime']>;
  toggleFullScreen(
    playerId: string,
    isFullScreen?: boolean | null,
  ): ReturnType<YoutubePlayerPlugin['toggleFullScreen']>;
  getPlaybackQuality(playerId: string): ReturnType<YoutubePlayerPlugin['getPlaybackQuality']>;
  setPlaybackQuality(
    playerId: string,
    suggestedQuality?: IPlaybackQuality,
  ): ReturnType<YoutubePlayerPlugin['setPlaybackQuality']>;
  getAvailableQualityLevels(playerId: string): ReturnType<YoutubePlayerPlugin['getAvailableQualityLevels']>;
  getDuration(playerId: string): ReturnType<YoutubePlayerPlugin['getDuration']>;
  getVideoUrl(playerId: string): ReturnType<YoutubePlayerPlugin['getVideoUrl']>;
  getVideoEmbedCode(playerId: string): ReturnType<YoutubePlayerPlugin['getVideoEmbedCode']>;
  getPlaylist(playerId: string): ReturnType<YoutubePlayerPlugin['getPlaylist']>;
  getPlaylistIndex(playerId: string): ReturnType<YoutubePlayerPlugin['getPlaylistIndex']>;
  getIframe(playerId: string): ReturnType<YoutubePlayerPlugin['getIframe']>;
  addEventListener<TEvent extends PlayerEvent>(
    playerId: string,
    eventName: keyof Events,
    listener: (event: TEvent) => void,
  ): void;
  removeEventListener<TEvent extends PlayerEvent>(
    playerId: string,
    eventName: keyof Events,
    listener: (event: TEvent) => void,
  ): void;
};

export type YoutubePlayerCompat = YoutubePlayerPlugin & YoutubePlayerLegacySignatures;

const normalizePlayerIdOptions = (optionsOrPlayerId: PlayerIdOptions | string): PlayerIdOptions =>
  typeof optionsOrPlayerId === 'string' ? { playerId: optionsOrPlayerId } : optionsOrPlayerId;

const normalizeSingleValueOptions = <TOptions extends PlayerIdOptions, TValue>(
  optionsOrPlayerId: TOptions | string,
  key: string,
  value: TValue,
): TOptions =>
  (typeof optionsOrPlayerId === 'string'
    ? {
        playerId: optionsOrPlayerId,
        [key]: value,
      }
    : optionsOrPlayerId) as TOptions;

const normalizeSeekToOptions = (
  optionsOrPlayerId: SeekToOptions | string,
  seconds?: number,
  allowSeekAhead?: boolean,
): SeekToOptions =>
  typeof optionsOrPlayerId === 'string'
    ? {
        playerId: optionsOrPlayerId,
        seconds: seconds ?? 0,
        allowSeekAhead: allowSeekAhead ?? true,
      }
    : optionsOrPlayerId;

const normalizeSetSizeOptions = (
  optionsOrPlayerId: SetSizeOptions | string,
  width?: number,
  height?: number,
): SetSizeOptions =>
  typeof optionsOrPlayerId === 'string'
    ? {
        playerId: optionsOrPlayerId,
        width: width ?? DEFAULT_WEB_PLAYER_SIZE.width,
        height: height ?? DEFAULT_WEB_PLAYER_SIZE.height,
      }
    : optionsOrPlayerId;

const normalizeToggleFullScreenOptions = (
  optionsOrPlayerId: ToggleFullScreenOptions | string,
  isFullScreen?: boolean | null,
): ToggleFullScreenOptions =>
  typeof optionsOrPlayerId === 'string'
    ? {
        playerId: optionsOrPlayerId,
        isFullScreen,
      }
    : optionsOrPlayerId;

const normalizeEventListenerOptions = <TEvent extends PlayerEvent>(
  optionsOrPlayerId: PlayerEventListenerOptions<TEvent> | string,
  eventName?: keyof Events,
  listener?: (event: TEvent) => void,
): PlayerEventListenerOptions<TEvent> =>
  typeof optionsOrPlayerId === 'string'
    ? {
        playerId: optionsOrPlayerId,
        eventName: eventName as keyof Events,
        listener: listener as (event: TEvent) => void,
      }
    : optionsOrPlayerId;

const normalizeEventListenerRegistration = <TEvent extends PlayerEvent>(
  optionsOrPlayerId: PlayerEventListenerOptions<TEvent> | string,
  eventName?: keyof Events,
  listener?: (event: TEvent) => void,
): {
  bridgeOptions: Omit<PlayerEventListenerOptions<TEvent>, 'listener'>;
  listener: (event: TEvent) => void;
} => {
  const normalizedOptions = normalizeEventListenerOptions(optionsOrPlayerId, eventName, listener);
  const { listener: normalizedListener, ...bridgeOptions } = normalizedOptions;
  return {
    bridgeOptions,
    listener: normalizedListener,
  };
};

const YoutubePlayer: YoutubePlayerCompat = {
  initialize: (options) => YoutubePlayerNative.initialize(options),
  destroy: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.destroy(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['destroy'],
  stopVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.stopVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['stopVideo'],
  playVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.playVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['playVideo'],
  pauseVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.pauseVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['pauseVideo'],
  seekTo: ((optionsOrPlayerId: SeekToOptions | string, seconds?: number, allowSeekAhead?: boolean) =>
    YoutubePlayerNative.seekTo(
      normalizeSeekToOptions(optionsOrPlayerId, seconds, allowSeekAhead),
    )) as YoutubePlayerCompat['seekTo'],
  loadVideoById: ((optionsOrPlayerId: VideoByIdMethodOptions | string, options?: IVideoOptionsById) =>
    YoutubePlayerNative.loadVideoById(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsById),
    )) as YoutubePlayerCompat['loadVideoById'],
  cueVideoById: ((optionsOrPlayerId: VideoByIdMethodOptions | string, options?: IVideoOptionsById) =>
    YoutubePlayerNative.cueVideoById(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsById),
    )) as YoutubePlayerCompat['cueVideoById'],
  loadVideoByUrl: ((optionsOrPlayerId: VideoByUrlMethodOptions | string, options?: IVideoOptionsByUrl) =>
    YoutubePlayerNative.loadVideoByUrl(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsByUrl),
    )) as YoutubePlayerCompat['loadVideoByUrl'],
  cueVideoByUrl: ((optionsOrPlayerId: VideoByUrlMethodOptions | string, options?: IVideoOptionsByUrl) =>
    YoutubePlayerNative.cueVideoByUrl(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsByUrl),
    )) as YoutubePlayerCompat['cueVideoByUrl'],
  cuePlaylist: ((optionsOrPlayerId: PlaylistMethodOptions | string, playlistOptions?: IPlaylistOptions) =>
    YoutubePlayerNative.cuePlaylist(
      normalizeSingleValueOptions(optionsOrPlayerId, 'playlistOptions', playlistOptions as IPlaylistOptions),
    )) as YoutubePlayerCompat['cuePlaylist'],
  loadPlaylist: ((optionsOrPlayerId: PlaylistMethodOptions | string, playlistOptions?: IPlaylistOptions) =>
    YoutubePlayerNative.loadPlaylist(
      normalizeSingleValueOptions(optionsOrPlayerId, 'playlistOptions', playlistOptions as IPlaylistOptions),
    )) as YoutubePlayerCompat['loadPlaylist'],
  nextVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.nextVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['nextVideo'],
  previousVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.previousVideo(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['previousVideo'],
  playVideoAt: ((optionsOrPlayerId: PlayVideoAtOptions | string, index?: number) =>
    YoutubePlayerNative.playVideoAt(
      normalizeSingleValueOptions(optionsOrPlayerId, 'index', index as number),
    )) as YoutubePlayerCompat['playVideoAt'],
  mute: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.mute(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['mute'],
  unMute: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.unMute(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['unMute'],
  isMuted: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.isMuted(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['isMuted'],
  setVolume: ((optionsOrPlayerId: SetVolumeOptions | string, volume?: number) =>
    YoutubePlayerNative.setVolume(
      normalizeSingleValueOptions(optionsOrPlayerId, 'volume', volume as number),
    )) as YoutubePlayerCompat['setVolume'],
  getVolume: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVolume(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['getVolume'],
  setSize: ((optionsOrPlayerId: SetSizeOptions | string, width?: number, height?: number) =>
    YoutubePlayerNative.setSize(
      normalizeSetSizeOptions(optionsOrPlayerId, width, height),
    )) as YoutubePlayerCompat['setSize'],
  getPlaybackRate: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaybackRate(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getPlaybackRate'],
  setPlaybackRate: ((optionsOrPlayerId: SetPlaybackRateOptions | string, suggestedRate?: number) =>
    YoutubePlayerNative.setPlaybackRate(
      normalizeSingleValueOptions(optionsOrPlayerId, 'suggestedRate', suggestedRate as number),
    )) as YoutubePlayerCompat['setPlaybackRate'],
  getAvailablePlaybackRates: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getAvailablePlaybackRates(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getAvailablePlaybackRates'],
  setLoop: ((optionsOrPlayerId: SetLoopOptions | string, loopPlaylists?: boolean) =>
    YoutubePlayerNative.setLoop(
      normalizeSingleValueOptions(optionsOrPlayerId, 'loopPlaylists', loopPlaylists as boolean),
    )) as YoutubePlayerCompat['setLoop'],
  setShuffle: ((optionsOrPlayerId: SetShuffleOptions | string, shufflePlaylist?: boolean) =>
    YoutubePlayerNative.setShuffle(
      normalizeSingleValueOptions(optionsOrPlayerId, 'shufflePlaylist', shufflePlaylist as boolean),
    )) as YoutubePlayerCompat['setShuffle'],
  getVideoLoadedFraction: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVideoLoadedFraction(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getVideoLoadedFraction'],
  getPlayerState: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlayerState(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getPlayerState'],
  getAllPlayersEventsState: () => YoutubePlayerNative.getAllPlayersEventsState(),
  getCurrentTime: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getCurrentTime(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getCurrentTime'],
  toggleFullScreen: ((optionsOrPlayerId: ToggleFullScreenOptions | string, isFullScreen?: boolean | null) =>
    YoutubePlayerNative.toggleFullScreen(
      normalizeToggleFullScreenOptions(optionsOrPlayerId, isFullScreen),
    )) as YoutubePlayerCompat['toggleFullScreen'],
  getPlaybackQuality: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaybackQuality(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getPlaybackQuality'],
  setPlaybackQuality: ((optionsOrPlayerId: SetPlaybackQualityOptions | string, suggestedQuality?: IPlaybackQuality) =>
    YoutubePlayerNative.setPlaybackQuality(
      normalizeSingleValueOptions(optionsOrPlayerId, 'suggestedQuality', suggestedQuality as IPlaybackQuality),
    )) as YoutubePlayerCompat['setPlaybackQuality'],
  getAvailableQualityLevels: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getAvailableQualityLevels(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getAvailableQualityLevels'],
  getDuration: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getDuration(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['getDuration'],
  getVideoUrl: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVideoUrl(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['getVideoUrl'],
  getVideoEmbedCode: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVideoEmbedCode(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getVideoEmbedCode'],
  getPlaylist: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaylist(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['getPlaylist'],
  getPlaylistIndex: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaylistIndex(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerCompat['getPlaylistIndex'],
  getIframe: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getIframe(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerCompat['getIframe'],
  addEventListener: ((
    optionsOrPlayerId: PlayerEventListenerOptions<PlayerEvent> | string,
    eventName?: keyof Events,
    listener?: (event: PlayerEvent) => void,
  ) => {
    const { bridgeOptions, listener: normalizedListener } = normalizeEventListenerRegistration(
      optionsOrPlayerId,
      eventName,
      listener,
    );

    if (Capacitor.getPlatform() !== 'web') {
      return;
    }

    YoutubePlayerNative.addEventListener({
      ...bridgeOptions,
      listener: normalizedListener,
    });
  }) as YoutubePlayerCompat['addEventListener'],
  removeEventListener: ((
    optionsOrPlayerId: PlayerEventListenerOptions<PlayerEvent> | string,
    eventName?: keyof Events,
    listener?: (event: PlayerEvent) => void,
  ) => {
    const { bridgeOptions, listener: normalizedListener } = normalizeEventListenerRegistration(
      optionsOrPlayerId,
      eventName,
      listener,
    );

    if (Capacitor.getPlatform() !== 'web') {
      return;
    }

    YoutubePlayerNative.removeEventListener({
      ...bridgeOptions,
      listener: normalizedListener,
    });
  }) as YoutubePlayerCompat['removeEventListener'],
  getPluginVersion: () => YoutubePlayerNative.getPluginVersion(),
};

export * from './definitions';
export { YoutubePlayer };
