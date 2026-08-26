/** Capacitor plugin listener event names emitted on Android, iOS, and Web. */
export const YOUTUBE_PLAYER_EVENTS = [
  'playerReady',
  'playerStateChange',
  'playerError',
  'currentTimeChange',
  'playbackRateChange',
  'fullscreenChange',
] as const;

export type YoutubePlayerEventName = (typeof YOUTUBE_PLAYER_EVENTS)[number];

export interface PlayerReadyEvent {
  playerId: string;
}

export interface PlayerStateChangeEvent {
  playerId: string;
  state: number;
}

export interface PlayerErrorEvent {
  playerId: string;
  code: number;
}

export interface CurrentTimeChangeEvent {
  playerId: string;
  currentTime: number;
}

export interface PlaybackRateChangeEvent {
  playerId: string;
  playbackRate: number;
}

export interface FullscreenChangeEvent {
  playerId: string;
  isFullscreen: boolean;
}

export type YoutubePlayerListenerEventMap = {
  playerReady: PlayerReadyEvent;
  playerStateChange: PlayerStateChangeEvent;
  playerError: PlayerErrorEvent;
  currentTimeChange: CurrentTimeChangeEvent;
  playbackRateChange: PlaybackRateChangeEvent;
  fullscreenChange: FullscreenChangeEvent;
};
