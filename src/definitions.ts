import type {
  IPlayerState,
  IPlayerOptions,
  IPlaylistOptions,
  IVideoOptionsById,
  IVideoOptionsByUrl,
  IPlaybackQuality,
  PlayerEvent,
  Events,
} from './web/models/models';

export interface PlayerIdOptions {
  playerId: string;
}

export interface SeekToOptions extends PlayerIdOptions {
  playerId: string;
  seconds: number;
  allowSeekAhead: boolean;
}

export interface VideoByIdMethodOptions extends PlayerIdOptions {
  playerId: string;
  options: IVideoOptionsById;
}

export interface VideoByUrlMethodOptions extends PlayerIdOptions {
  playerId: string;
  options: IVideoOptionsByUrl;
}

export interface PlaylistMethodOptions extends PlayerIdOptions {
  playerId: string;
  playlistOptions: IPlaylistOptions;
}

export interface PlayVideoAtOptions extends PlayerIdOptions {
  playerId: string;
  index: number;
}

export interface SetVolumeOptions extends PlayerIdOptions {
  playerId: string;
  volume: number;
}

export interface SetSizeOptions extends PlayerIdOptions {
  playerId: string;
  width: number;
  height: number;
}

export interface SetPlaybackRateOptions extends PlayerIdOptions {
  playerId: string;
  suggestedRate: number;
}

export interface SetLoopOptions extends PlayerIdOptions {
  playerId: string;
  loopPlaylists: boolean;
}

export interface SetShuffleOptions extends PlayerIdOptions {
  playerId: string;
  shufflePlaylist: boolean;
}

export interface ToggleFullScreenOptions extends PlayerIdOptions {
  playerId: string;
  isFullScreen: boolean | null | undefined;
}

export interface SetPlaybackQualityOptions extends PlayerIdOptions {
  playerId: string;
  suggestedQuality: IPlaybackQuality;
}

export interface PlayerEventListenerOptions<TEvent extends PlayerEvent = PlayerEvent> extends PlayerIdOptions {
  playerId: string;
  eventName: keyof Events;
  listener: (event: TEvent) => void;
}

/**
 * YouTube Player Plugin interface for Capacitor.
 * Provides methods to control YouTube video playback in your app.
 */
export interface YoutubePlayerPlugin {
  /**
   * Initialize a new YouTube player instance.
   *
   * @param options - Configuration options for the player
   * @returns Promise resolving when player is ready
   * @example
   * ```typescript
   * await YoutubePlayer.initialize({
   *   playerId: 'my-player',
   *   videoId: 'dQw4w9WgXcQ',
   *   playerSize: { width: 640, height: 360 },
   *   privacyEnhanced: true
   * });
   * ```
   * @example
   * // With cookies to prevent bot detection
   * ```typescript
   * await YoutubePlayer.initialize({
   *   playerId: 'my-player',
   *   videoId: 'dQw4w9WgXcQ',
   *   playerSize: { width: 640, height: 360 },
   *   cookies: 'CONSENT=YES+cb; VISITOR_INFO1_LIVE=xyz123'
   * });
   * ```
   */
  initialize(options: IPlayerOptions): Promise<{ playerReady: boolean; player: string } | undefined>;

  /**
   * Destroy a player instance and free resources.
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  destroy(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Playback Controls
  // ========================================

  /**
   * Stop video playback and cancel loading.
   * Use this sparingly - pauseVideo() is usually preferred.
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  stopVideo(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Play the currently cued or loaded video.
   * Final player state will be PLAYING (1).
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  playVideo(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Pause the currently playing video.
   * Final player state will be PAUSED (2), unless already ENDED (0).
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  pauseVideo(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Seek to a specific time in the video.
   * If player is paused, it remains paused. If playing, continues playing.
   *
   * @param options - Player seek options
   * @returns Promise with operation result including seek parameters
   */
  seekTo(
    options: SeekToOptions,
  ): Promise<{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean } }>;

  /**
   * Load and play a video by its YouTube ID.
   *
   * @param options - Video loading options (ID, start time, quality, etc.)
   * @returns Promise with operation result
   */
  loadVideoById(
    options: VideoByIdMethodOptions,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById } }>;

  /**
   * Cue a video by ID without playing it.
   * Loads thumbnail and prepares player, but doesn't request video until playVideo() called.
   *
   * @param options - Video cuing options (ID, start time, quality, etc.)
   * @returns Promise with operation result
   */
  cueVideoById(
    options: VideoByIdMethodOptions,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById } }>;

  /**
   * Load and play a video by its full URL.
   *
   * @param options - Video loading options including media URL
   * @returns Promise with operation result
   */
  loadVideoByUrl(
    options: VideoByUrlMethodOptions,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl } }>;

  /**
   * Cue a video by URL without playing it.
   *
   * @param options - Video cuing options including media URL
   * @returns Promise with operation result
   */
  cueVideoByUrl(
    options: VideoByUrlMethodOptions,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl } }>;

  // ========================================
  // Playlist Methods
  // ========================================

  /**
   * Cue a playlist without playing it.
   * Loads playlist and prepares first video.
   *
   * @param playlistOptions - Playlist configuration (type, ID, index, etc.)
   * @returns Promise with operation result
   */
  cuePlaylist(options: PlaylistMethodOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Load and play a playlist.
   *
   * @param playlistOptions - Playlist configuration (type, ID, index, etc.)
   * @returns Promise with operation result
   */
  loadPlaylist(options: PlaylistMethodOptions): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Playlist Navigation
  // ========================================

  /**
   * Play the next video in the playlist.
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  nextVideo(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Play the previous video in the playlist.
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  previousVideo(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Play a specific video in the playlist by index.
   *
   * @param options - Player playlist navigation options
   * @returns Promise with operation result
   */
  playVideoAt(options: PlayVideoAtOptions): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Volume Controls
  // ========================================

  /**
   * Mute the player audio.
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  mute(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Unmute the player audio.
   *
   * @param options - Player instance options
   * @returns Promise with operation result
   */
  unMute(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Check if the player is currently muted.
   *
   * @param options - Player instance options
   * @returns Promise with mute status (true = muted, false = not muted)
   */
  isMuted(options: PlayerIdOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Set the player volume level.
   *
   * @param options - Player volume options
   * @returns Promise with the volume that was set
   */
  setVolume(options: SetVolumeOptions): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get the current player volume level.
   * Returns volume even if player is muted.
   *
   * @param options - Player instance options
   * @returns Promise with current volume (0-100)
   */
  getVolume(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  // ========================================
  // Player Size
  // ========================================

  /**
   * Set the player dimensions in pixels.
   *
   * @param options - Player size options
   * @returns Promise with the dimensions that were set
   */
  setSize(options: SetSizeOptions): Promise<{ result: { method: string; value: { width: number; height: number } } }>;

  // ========================================
  // Playback Speed
  // ========================================

  /**
   * Get the current playback rate.
   *
   * @param options - Player instance options
   * @returns Promise with playback rate (e.g., 0.5, 1, 1.5, 2)
   */
  getPlaybackRate(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  /**
   * Set the playback speed.
   *
   * @param options - Playback rate options
   * @returns Promise with operation result
   */
  setPlaybackRate(options: SetPlaybackRateOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Get list of available playback rates for current video.
   *
   * @param options - Player instance options
   * @returns Promise with array of available rates
   */
  getAvailablePlaybackRates(options: PlayerIdOptions): Promise<{ result: { method: string; value: number[] } }>;

  // ========================================
  // Playlist Settings
  // ========================================

  /**
   * Enable or disable playlist looping.
   * When enabled, playlist will restart from beginning after last video.
   *
   * @param options - Playlist loop options
   * @returns Promise with operation result
   */
  setLoop(options: SetLoopOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Enable or disable playlist shuffle.
   *
   * @param options - Playlist shuffle options
   * @returns Promise with operation result
   */
  setShuffle(options: SetShuffleOptions): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Playback Status
  // ========================================

  /**
   * Get the fraction of the video that has been buffered.
   * More reliable than deprecated getVideoBytesLoaded/getVideoBytesTotal.
   *
   * @param options - Player instance options
   * @returns Promise with fraction between 0 and 1
   */
  getVideoLoadedFraction(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get the current state of the player.
   *
   * @param options - Player instance options
   * @returns Promise with state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
   */
  getPlayerState(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get event states for all active players.
   * Useful for tracking multiple player instances.
   *
   * @returns Promise with map of player IDs to their event states
   */
  getAllPlayersEventsState(): Promise<{ result: { method: string; value: Map<string, IPlayerState> } }>;

  /**
   * Get the current playback position in seconds.
   *
   * @param options - Player instance options
   * @returns Promise with current time in seconds
   */
  getCurrentTime(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  /**
   * Toggle fullscreen mode on or off.
   *
   * @param options - Fullscreen options
   * @returns Promise with the fullscreen state that was set
   */
  toggleFullScreen(
    options: ToggleFullScreenOptions,
  ): Promise<{ result: { method: string; value: boolean | null | undefined } }>;

  // ========================================
  // Playback Quality
  // ========================================

  /**
   * Get the current playback quality.
   *
   * @param options - Player instance options
   * @returns Promise with quality level (small, medium, large, hd720, hd1080, highres, default)
   */
  getPlaybackQuality(options: PlayerIdOptions): Promise<{ result: { method: string; value: IPlaybackQuality } }>;

  /**
   * Set the suggested playback quality.
   * Actual quality may differ based on network conditions.
   *
   * @param options - Playback quality options
   * @returns Promise with operation result
   */
  setPlaybackQuality(options: SetPlaybackQualityOptions): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Get list of available quality levels for current video.
   *
   * @param options - Player instance options
   * @returns Promise with array of available quality levels
   */
  getAvailableQualityLevels(
    options: PlayerIdOptions,
  ): Promise<{ result: { method: string; value: IPlaybackQuality[] } }>;

  // ========================================
  // Video Information
  // ========================================

  /**
   * Get the duration of the current video in seconds.
   *
   * @param options - Player instance options
   * @returns Promise with duration in seconds
   */
  getDuration(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get the YouTube.com URL for the current video.
   *
   * @param options - Player instance options
   * @returns Promise with video URL
   */
  getVideoUrl(options: PlayerIdOptions): Promise<{ result: { method: string; value: string } }>;

  /**
   * Get the embed code for the current video.
   * Returns HTML iframe embed code.
   *
   * @param options - Player instance options
   * @returns Promise with iframe embed code
   */
  getVideoEmbedCode(options: PlayerIdOptions): Promise<{ result: { method: string; value: string } }>;

  // ========================================
  // Playlist Information
  // ========================================

  /**
   * Get array of video IDs in the current playlist.
   *
   * @param options - Player instance options
   * @returns Promise with array of video IDs
   */
  getPlaylist(options: PlayerIdOptions): Promise<{ result: { method: string; value: string[] } }>;

  /**
   * Get the index of the currently playing video in the playlist.
   *
   * @param options - Player instance options
   * @returns Promise with zero-based index
   */
  getPlaylistIndex(options: PlayerIdOptions): Promise<{ result: { method: string; value: number } }>;

  // ========================================
  // DOM Access
  // ========================================

  /**
   * Get the iframe DOM element for the player.
   * Web platform only.
   *
   * @param options - Player instance options
   * @returns Promise with iframe element
   */
  getIframe(options: PlayerIdOptions): Promise<{ result: { method: string; value: HTMLIFrameElement } }>;

  // ========================================
  // Event Listeners
  // ========================================

  /**
   * Add an event listener to the player.
   * Web platform only.
   *
   * @param options - Event listener options
   * @example
   * ```typescript
   * YoutubePlayer.addEventListener({
   *   playerId: 'my-player',
   *   eventName: 'onStateChange',
   *   listener: (event) => {
   *   console.log('Player state:', event.data);
   *   },
   * });
   * ```
   */
  addEventListener<TEvent extends PlayerEvent>(options: PlayerEventListenerOptions<TEvent>): void;

  /**
   * Remove an event listener from the player.
   * Web platform only.
   *
   * @param options - Event listener options
   */
  removeEventListener<TEvent extends PlayerEvent>(options: PlayerEventListenerOptions<TEvent>): void;

  // ========================================
  // Plugin Information
  // ========================================

  /**
   * Get the plugin version number.
   * Returns platform-specific version information.
   *
   * @returns Promise with version string
   * @example
   * ```typescript
   * const { version } = await YoutubePlayer.getPluginVersion();
   * console.log('Plugin version:', version);
   * ```
   */
  getPluginVersion(): Promise<{ version: string }>;
}
