import { registerPlugin } from '@capacitor/core';

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

const YoutubePlayer: YoutubePlayerPlugin = {
  initialize: (options) => YoutubePlayerNative.initialize(options),
  destroy: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.destroy(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['destroy'],
  stopVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.stopVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['stopVideo'],
  playVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.playVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['playVideo'],
  pauseVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.pauseVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['pauseVideo'],
  seekTo: ((optionsOrPlayerId: SeekToOptions | string, seconds?: number, allowSeekAhead?: boolean) =>
    YoutubePlayerNative.seekTo(
      normalizeSeekToOptions(optionsOrPlayerId, seconds, allowSeekAhead),
    )) as YoutubePlayerPlugin['seekTo'],
  loadVideoById: ((optionsOrPlayerId: VideoByIdMethodOptions | string, options?: IVideoOptionsById) =>
    YoutubePlayerNative.loadVideoById(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsById),
    )) as YoutubePlayerPlugin['loadVideoById'],
  cueVideoById: ((optionsOrPlayerId: VideoByIdMethodOptions | string, options?: IVideoOptionsById) =>
    YoutubePlayerNative.cueVideoById(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsById),
    )) as YoutubePlayerPlugin['cueVideoById'],
  loadVideoByUrl: ((optionsOrPlayerId: VideoByUrlMethodOptions | string, options?: IVideoOptionsByUrl) =>
    YoutubePlayerNative.loadVideoByUrl(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsByUrl),
    )) as YoutubePlayerPlugin['loadVideoByUrl'],
  cueVideoByUrl: ((optionsOrPlayerId: VideoByUrlMethodOptions | string, options?: IVideoOptionsByUrl) =>
    YoutubePlayerNative.cueVideoByUrl(
      normalizeSingleValueOptions(optionsOrPlayerId, 'options', options as IVideoOptionsByUrl),
    )) as YoutubePlayerPlugin['cueVideoByUrl'],
  cuePlaylist: ((optionsOrPlayerId: PlaylistMethodOptions | string, playlistOptions?: IPlaylistOptions) =>
    YoutubePlayerNative.cuePlaylist(
      normalizeSingleValueOptions(optionsOrPlayerId, 'playlistOptions', playlistOptions as IPlaylistOptions),
    )) as YoutubePlayerPlugin['cuePlaylist'],
  loadPlaylist: ((optionsOrPlayerId: PlaylistMethodOptions | string, playlistOptions?: IPlaylistOptions) =>
    YoutubePlayerNative.loadPlaylist(
      normalizeSingleValueOptions(optionsOrPlayerId, 'playlistOptions', playlistOptions as IPlaylistOptions),
    )) as YoutubePlayerPlugin['loadPlaylist'],
  nextVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.nextVideo(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['nextVideo'],
  previousVideo: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.previousVideo(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['previousVideo'],
  playVideoAt: ((optionsOrPlayerId: PlayVideoAtOptions | string, index?: number) =>
    YoutubePlayerNative.playVideoAt(
      normalizeSingleValueOptions(optionsOrPlayerId, 'index', index as number),
    )) as YoutubePlayerPlugin['playVideoAt'],
  mute: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.mute(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['mute'],
  unMute: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.unMute(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['unMute'],
  isMuted: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.isMuted(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['isMuted'],
  setVolume: ((optionsOrPlayerId: SetVolumeOptions | string, volume?: number) =>
    YoutubePlayerNative.setVolume(
      normalizeSingleValueOptions(optionsOrPlayerId, 'volume', volume as number),
    )) as YoutubePlayerPlugin['setVolume'],
  getVolume: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVolume(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['getVolume'],
  setSize: ((optionsOrPlayerId: SetSizeOptions | string, width?: number, height?: number) =>
    YoutubePlayerNative.setSize(
      normalizeSetSizeOptions(optionsOrPlayerId, width, height),
    )) as YoutubePlayerPlugin['setSize'],
  getPlaybackRate: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaybackRate(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getPlaybackRate'],
  setPlaybackRate: ((optionsOrPlayerId: SetPlaybackRateOptions | string, suggestedRate?: number) =>
    YoutubePlayerNative.setPlaybackRate(
      normalizeSingleValueOptions(optionsOrPlayerId, 'suggestedRate', suggestedRate as number),
    )) as YoutubePlayerPlugin['setPlaybackRate'],
  getAvailablePlaybackRates: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getAvailablePlaybackRates(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getAvailablePlaybackRates'],
  setLoop: ((optionsOrPlayerId: SetLoopOptions | string, loopPlaylists?: boolean) =>
    YoutubePlayerNative.setLoop(
      normalizeSingleValueOptions(optionsOrPlayerId, 'loopPlaylists', loopPlaylists as boolean),
    )) as YoutubePlayerPlugin['setLoop'],
  setShuffle: ((optionsOrPlayerId: SetShuffleOptions | string, shufflePlaylist?: boolean) =>
    YoutubePlayerNative.setShuffle(
      normalizeSingleValueOptions(optionsOrPlayerId, 'shufflePlaylist', shufflePlaylist as boolean),
    )) as YoutubePlayerPlugin['setShuffle'],
  getVideoLoadedFraction: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVideoLoadedFraction(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getVideoLoadedFraction'],
  getPlayerState: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlayerState(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getPlayerState'],
  getAllPlayersEventsState: () => YoutubePlayerNative.getAllPlayersEventsState(),
  getCurrentTime: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getCurrentTime(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getCurrentTime'],
  toggleFullScreen: ((optionsOrPlayerId: ToggleFullScreenOptions | string, isFullScreen?: boolean | null) =>
    YoutubePlayerNative.toggleFullScreen(
      normalizeToggleFullScreenOptions(optionsOrPlayerId, isFullScreen),
    )) as YoutubePlayerPlugin['toggleFullScreen'],
  getPlaybackQuality: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaybackQuality(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getPlaybackQuality'],
  setPlaybackQuality: ((optionsOrPlayerId: SetPlaybackQualityOptions | string, suggestedQuality?: IPlaybackQuality) =>
    YoutubePlayerNative.setPlaybackQuality(
      normalizeSingleValueOptions(optionsOrPlayerId, 'suggestedQuality', suggestedQuality as IPlaybackQuality),
    )) as YoutubePlayerPlugin['setPlaybackQuality'],
  getAvailableQualityLevels: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getAvailableQualityLevels(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getAvailableQualityLevels'],
  getDuration: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getDuration(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['getDuration'],
  getVideoUrl: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVideoUrl(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['getVideoUrl'],
  getVideoEmbedCode: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getVideoEmbedCode(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getVideoEmbedCode'],
  getPlaylist: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaylist(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['getPlaylist'],
  getPlaylistIndex: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getPlaylistIndex(
      normalizePlayerIdOptions(optionsOrPlayerId),
    )) as YoutubePlayerPlugin['getPlaylistIndex'],
  getIframe: ((optionsOrPlayerId: PlayerIdOptions | string) =>
    YoutubePlayerNative.getIframe(normalizePlayerIdOptions(optionsOrPlayerId))) as YoutubePlayerPlugin['getIframe'],
  addEventListener: ((
    optionsOrPlayerId: PlayerEventListenerOptions<PlayerEvent> | string,
    eventName?: keyof Events,
    listener?: (event: PlayerEvent) => void,
  ) =>
    YoutubePlayerNative.addEventListener(
      normalizeEventListenerOptions(optionsOrPlayerId, eventName, listener),
    )) as YoutubePlayerPlugin['addEventListener'],
  removeEventListener: ((
    optionsOrPlayerId: PlayerEventListenerOptions<PlayerEvent> | string,
    eventName?: keyof Events,
    listener?: (event: PlayerEvent) => void,
  ) =>
    YoutubePlayerNative.removeEventListener(
      normalizeEventListenerOptions(optionsOrPlayerId, eventName, listener),
    )) as YoutubePlayerPlugin['removeEventListener'],
  getPluginVersion: () => YoutubePlayerNative.getPluginVersion(),
};

export * from './definitions';
export { YoutubePlayer };
