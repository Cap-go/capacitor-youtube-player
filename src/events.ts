/** Capacitor plugin listener event names emitted on Android, iOS, and Web. */
export const YOUTUBE_PLAYER_EVENTS = [
  'playerReady',
  'playerStateChange',
  'playerError',
  'currentTimeChange',
  'playbackRateChange',
  'fullscreenChange',
] as const;

export type { YoutubePlayerEventName, YoutubePlayerListenerEventMap } from './definitions';
