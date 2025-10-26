/**
 * Utility type that makes specific keys of an interface required.
 * @template T - The base type
 * @template K - Keys to make required
 */
export type RequiredKeys<T, K extends keyof T> = Exclude<T, K> & { [key in K]-?: Required<T[key]> };

/**
 * Available playback quality levels for YouTube videos.
 * Quality may be automatically adjusted based on network conditions.
 */
export enum IPlaybackQuality {
  /** Small quality (240p) */
  SMALL = 'small',
  /** Medium quality (360p) */
  MEDIUM = 'medium',
  /** Large quality (480p) */
  LARGE = 'large',
  /** High definition 720p */
  HD720 = 'hd720',
  /** High definition 1080p */
  HD1080 = 'hd1080',
  /** Highest resolution available (1440p+) */
  HIGH_RES = 'highres',
  /** Default quality selected by YouTube */
  DEFAULT = 'default',
}

/**
 * Possible states of the YouTube player.
 * Use these values to track playback status.
 */
export enum PlayerState {
  /** Video has not started (-1) */
  UNSTARTED = -1,
  /** Video has ended (0) */
  ENDED = 0,
  /** Video is currently playing (1) */
  PLAYING = 1,
  /** Video is paused (2) */
  PAUSED = 2,
  /** Video is buffering (3) */
  BUFFERING = 3,
  /** Video is cued and ready to play (5) */
  CUED = 5,
}

/**
 * Known causes for player errors.
 */
export enum PlayerError {
  /**
   * The request contained an invalid parameter value.
   */
  InvalidParam = 2,

  /**
   * The requested content cannot be played in an HTML5 player.
   */
  Html5Error = 5,

  /**
   * The video requested was not found.
   */
  VideoNotFound = 100,

  /**
   * The owner of the requested video does not allow it to be played in embedded players.
   */
  EmbeddingNotAllowed = 101,

  /**
   * This error is the same as 101. It's just a 101 error in disguise!
   */
  EmbeddingNotAllowed2 = 150,
}

/**
 * Configuration options for initializing a YouTube player instance.
 * All size and playback settings are configured through this interface.
 */
export interface IPlayerOptions {
  /**
   * Unique identifier for the player instance.
   * Used to reference this player in API calls.
   */
  playerId?: string;

  /**
   * Dimensions of the player in pixels.
   */
  playerSize: IPlayerSize;

  /**
   * YouTube video ID to load.
   * @example 'dQw4w9WgXcQ'
   */
  videoId: string;

  /**
   * Whether to start the video in fullscreen mode.
   * @default false
   */
  fullscreen?: boolean;

  /**
   * YouTube player parameters to customize playback behavior.
   * See: https://developers.google.com/youtube/player_parameters
   */
  playerVars?: IPlayerVars;

  /**
   * Enable debug logging for troubleshooting.
   * @default false
   */
  debug?: boolean;

  /**
   * Use privacy-enhanced mode (youtube-nocookie.com) for better GDPR compliance.
   * When enabled, YouTube won't store information about visitors on your website
   * unless they play the video.
   *
   * **Note:** Only applies to web platform. Native platforms use different APIs.
   * @default false
   */
  privacyEnhanced?: boolean;
}

/**
 * Player dimensions in pixels.
 */
export interface IPlayerSize {
  /** Height in pixels */
  height: number;
  /** Width in pixels */
  width: number;
}

/**
 * YouTube player parameters for customizing player behavior and appearance.
 * @see https://developers.google.com/youtube/player_parameters
 */
export interface IPlayerVars {
  /** Whether to autoplay the video (0 = no, 1 = yes) */
  autoplay?: number;

  /** Force closed captions to show by default (1 = show) */
  cc_load_policy?: number;

  /** Player controls color ('red' or 'white') */
  color?: string;

  /** Whether to show player controls (0 = hide, 1 = show, 2 = show on load) */
  controls?: number;

  /** Disable keyboard controls (0 = enable, 1 = disable) */
  disablekb?: number;

  /** Enable JavaScript API (1 = enable) */
  enablejsapi?: number;

  /** Time in seconds to stop playback */
  end?: number;

  /** Show fullscreen button (0 = hide, 1 = show) */
  fs?: number;

  /** Player interface language (ISO 639-1 code) */
  hl?: string;

  /** Show video annotations (1 = show, 3 = hide) */
  iv_load_policy?: number;

  /** Playlist or content ID to load */
  list?: string;

  /** Type of content in 'list' parameter */
  listType?: string;

  /** Loop the video (0 = no, 1 = yes, requires playlist) */
  loop?: number;

  /** Hide YouTube logo (0 = show, 1 = hide) */
  modestbranding?: number;

  /** Domain origin for extra security */
  origin?: string;

  /** Comma-separated list of video IDs to play */
  playlist?: string;

  /** Play inline on iOS (0 = fullscreen, 1 = inline) */
  playsinline?: number;

  /** Show related videos (0 = from same channel, 1 = any) */
  rel?: number;

  /** Show video information (deprecated, always hidden) */
  showinfo?: number;

  /** Time in seconds to start playback */
  start?: number;
}

/**
 * Internal state tracking for player events.
 * Used to monitor which events have been triggered.
 */
export interface IPlayerState {
  /** Event handlers and their states */
  events: {
    /** Player ready event state */
    onReady?: unknown;
    /** Player state change event */
    onStateChange?: unknown;
    /** Playback quality change event */
    onPlaybackQualityChange?: unknown;
    /** Error event state */
    onError?: unknown;
  };
}

/**
 * Options for loading and playing YouTube playlists.
 */
export interface IPlaylistOptions {
  /** Type of playlist to load */
  listType: 'playlist' | 'search' | 'user_uploads';

  /** Playlist ID or search query (depending on listType) */
  list?: string;

  /** Array of video IDs to play as a playlist */
  playlist?: string[];

  /** Index of the video to start with (0-based) */
  index?: number;

  /** Time in seconds to start the first video */
  startSeconds?: number;

  /** Suggested playback quality */
  suggestedQuality?: string;
}

/**
 * Base options for video playback configuration.
 */
export interface IVideoOptions {
  /** Time in seconds to start playback */
  startSeconds?: number;

  /** Time in seconds to end playback */
  endSeconds?: number;

  /** Suggested playback quality level */
  suggestedQuality?: IPlaybackQuality;
}

/**
 * Options for loading a video by its YouTube ID.
 * @extends IVideoOptions
 */
export interface IVideoOptionsById extends IVideoOptions {
  /** YouTube video ID */
  videoId: string;
}

/**
 * Options for loading a video by its media URL.
 * @extends IVideoOptions
 */
export interface IVideoOptionsByUrl extends IVideoOptions {
  /** Full YouTube video URL */
  mediaContentUrl: string;
}

/**
 * Base interface for events triggered by a player.
 */
export interface PlayerEvent {
  /**
   * Video player corresponding to the event.
   */
  target: Element;
}

/**
 * Event for player state change.
 */
export interface OnStateChangeEvent extends PlayerEvent {
  /**
   * New player state.
   */
  data: PlayerState;
}

/**
 * Event for playback quality change.
 */
export interface OnPlaybackQualityChangeEvent extends PlayerEvent {
  /**
   * New playback quality.
   */
  data: string;
}

/**
 * Event for playback rate change.
 */
export interface OnPlaybackRateChangeEvent extends PlayerEvent {
  /**
   * New playback rate.
   */
  data: number;
}

/**
 * Event for a player error.
 */
export interface OnErrorEvent extends PlayerEvent {
  /**
   * Which type of error occurred.
   */
  data: PlayerError;
}

/**
 * Handles a player event.
 *
 * @param event   The triggering event.
 */
export interface PlayerEventHandler<TEvent extends PlayerEvent> {
  (event: TEvent): void;
}

/**
 * * Handlers for events fired by the player.
 */
export interface Events {
  /**
   * Event fired when a player has finished loading and is ready to begin receiving API calls.
   */
  onReady?: PlayerEventHandler<PlayerEvent> | undefined;

  /**
   * Event fired when the player's state changes.
   */
  onStateChange?: PlayerEventHandler<OnStateChangeEvent> | undefined;

  /**
   * Event fired when the playback quality of the player changes.
   */
  onPlaybackQualityChange?: PlayerEventHandler<OnPlaybackQualityChangeEvent> | undefined;

  /**
   * Event fired when the playback rate of the player changes.
   */
  onPlaybackRateChange?: PlayerEventHandler<OnPlaybackRateChangeEvent> | undefined;

  /**
   * Event fired when an error in the player occurs
   */
  onError?: PlayerEventHandler<OnErrorEvent> | undefined;

  /**
   * Event fired to indicate that the player has loaded, or unloaded, a module
   * with exposed API methods. This currently only occurs for closed captioning.
   */
  onApiChange?: PlayerEventHandler<PlayerEvent> | undefined;
}

/**
 * Logger interface for internal plugin debugging and monitoring.
 * Provides various logging levels for different types of messages.
 */
export interface IPlayerLog {
  /**
   * Log general information messages.
   * @param primaryMessage - Main log message
   * @param supportingData - Additional data to log
   */
  log(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Log debug messages for development.
   * @param primaryMessage - Main debug message
   * @param supportingData - Additional debug data
   */
  debug(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Log warning messages for potential issues.
   * @param primaryMessage - Main warning message
   * @param supportingData - Additional warning data
   */
  warn(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Log error messages for failures.
   * @param primaryMessage - Main error message
   * @param supportingData - Additional error data
   */
  error(primaryMessage: string, ...supportingData: any[]): void;

  /**
   * Log informational messages.
   * @param primaryMessage - Main info message
   * @param supportingData - Additional info data
   */
  info(primaryMessage: string, ...supportingData: any[]): void;
}
