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
   */
  initialize(options: IPlayerOptions): Promise<{ playerReady: boolean; player: string } | undefined>;

  /**
   * Destroy a player instance and free resources.
   *
   * @param playerId - ID of the player to destroy
   * @returns Promise with operation result
   */
  destroy(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Playback Controls
  // ========================================

  /**
   * Stop video playback and cancel loading.
   * Use this sparingly - pauseVideo() is usually preferred.
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  stopVideo(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Play the currently cued or loaded video.
   * Final player state will be PLAYING (1).
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  playVideo(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Pause the currently playing video.
   * Final player state will be PAUSED (2), unless already ENDED (0).
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  pauseVideo(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Seek to a specific time in the video.
   * If player is paused, it remains paused. If playing, continues playing.
   *
   * @param playerId - ID of the player
   * @param seconds - Time to seek to (in seconds)
   * @param allowSeekAhead - Whether to make a new request to server if not buffered
   * @returns Promise with operation result including seek parameters
   */
  seekTo(
    playerId: string,
    seconds: number,
    allowSeekAhead: boolean,
  ): Promise<{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean } }>;

  /**
   * Load and play a video by its YouTube ID.
   *
   * @param playerId - ID of the player
   * @param options - Video loading options (ID, start time, quality, etc.)
   * @returns Promise with operation result
   */
  loadVideoById(
    playerId: string,
    options: IVideoOptionsById,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById } }>;

  /**
   * Cue a video by ID without playing it.
   * Loads thumbnail and prepares player, but doesn't request video until playVideo() called.
   *
   * @param playerId - ID of the player
   * @param options - Video cuing options (ID, start time, quality, etc.)
   * @returns Promise with operation result
   */
  cueVideoById(
    playerId: string,
    options: IVideoOptionsById,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById } }>;

  /**
   * Load and play a video by its full URL.
   *
   * @param playerId - ID of the player
   * @param options - Video loading options including media URL
   * @returns Promise with operation result
   */
  loadVideoByUrl(
    playerId: string,
    options: IVideoOptionsByUrl,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl } }>;

  /**
   * Cue a video by URL without playing it.
   *
   * @param playerId - ID of the player
   * @param options - Video cuing options including media URL
   * @returns Promise with operation result
   */
  cueVideoByUrl(
    playerId: string,
    options: IVideoOptionsByUrl,
  ): Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl } }>;

  // ========================================
  // Playlist Methods
  // ========================================

  /**
   * Cue a playlist without playing it.
   * Loads playlist and prepares first video.
   *
   * @param playerId - ID of the player
   * @param playlistOptions - Playlist configuration (type, ID, index, etc.)
   * @returns Promise with operation result
   */
  cuePlaylist(
    playerId: string,
    playlistOptions: IPlaylistOptions,
  ): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Load and play a playlist.
   *
   * @param playerId - ID of the player
   * @param playlistOptions - Playlist configuration (type, ID, index, etc.)
   * @returns Promise with operation result
   */
  loadPlaylist(
    playerId: string,
    playlistOptions: IPlaylistOptions,
  ): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Playlist Navigation
  // ========================================

  /**
   * Play the next video in the playlist.
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  nextVideo(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Play the previous video in the playlist.
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  previousVideo(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Play a specific video in the playlist by index.
   *
   * @param playerId - ID of the player
   * @param index - Zero-based index of the video to play
   * @returns Promise with operation result
   */
  playVideoAt(playerId: string, index: number): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Volume Controls
  // ========================================

  /**
   * Mute the player audio.
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  mute(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Unmute the player audio.
   *
   * @param playerId - ID of the player
   * @returns Promise with operation result
   */
  unMute(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Check if the player is currently muted.
   *
   * @param playerId - ID of the player
   * @returns Promise with mute status (true = muted, false = not muted)
   */
  isMuted(playerId: string): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Set the player volume level.
   *
   * @param playerId - ID of the player
   * @param volume - Volume level from 0 (silent) to 100 (max)
   * @returns Promise with the volume that was set
   */
  setVolume(playerId: string, volume: number): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get the current player volume level.
   * Returns volume even if player is muted.
   *
   * @param playerId - ID of the player
   * @returns Promise with current volume (0-100)
   */
  getVolume(playerId: string): Promise<{ result: { method: string; value: number } }>;

  // ========================================
  // Player Size
  // ========================================

  /**
   * Set the player dimensions in pixels.
   *
   * @param playerId - ID of the player
   * @param width - Width in pixels
   * @param height - Height in pixels
   * @returns Promise with the dimensions that were set
   */
  setSize(
    playerId: string,
    width: number,
    height: number,
  ): Promise<{ result: { method: string; value: { width: number; height: number } } }>;

  // ========================================
  // Playback Speed
  // ========================================

  /**
   * Get the current playback rate.
   *
   * @param playerId - ID of the player
   * @returns Promise with playback rate (e.g., 0.5, 1, 1.5, 2)
   */
  getPlaybackRate(playerId: string): Promise<{ result: { method: string; value: number } }>;

  /**
   * Set the playback speed.
   *
   * @param playerId - ID of the player
   * @param suggestedRate - Desired playback rate (0.25 to 2.0)
   * @returns Promise with operation result
   */
  setPlaybackRate(playerId: string, suggestedRate: number): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Get list of available playback rates for current video.
   *
   * @param playerId - ID of the player
   * @returns Promise with array of available rates
   */
  getAvailablePlaybackRates(playerId: string): Promise<{ result: { method: string; value: number[] } }>;

  // ========================================
  // Playlist Settings
  // ========================================

  /**
   * Enable or disable playlist looping.
   * When enabled, playlist will restart from beginning after last video.
   *
   * @param playerId - ID of the player
   * @param loopPlaylists - true to loop, false to stop after last video
   * @returns Promise with operation result
   */
  setLoop(playerId: string, loopPlaylists: boolean): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Enable or disable playlist shuffle.
   *
   * @param playerId - ID of the player
   * @param shufflePlaylist - true to shuffle, false for sequential
   * @returns Promise with operation result
   */
  setShuffle(playerId: string, shufflePlaylist: boolean): Promise<{ result: { method: string; value: boolean } }>;

  // ========================================
  // Playback Status
  // ========================================

  /**
   * Get the fraction of the video that has been buffered.
   * More reliable than deprecated getVideoBytesLoaded/getVideoBytesTotal.
   *
   * @param playerId - ID of the player
   * @returns Promise with fraction between 0 and 1
   */
  getVideoLoadedFraction(playerId: string): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get the current state of the player.
   *
   * @param playerId - ID of the player
   * @returns Promise with state: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
   */
  getPlayerState(playerId: string): Promise<{ result: { method: string; value: number } }>;

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
   * @param playerId - ID of the player
   * @returns Promise with current time in seconds
   */
  getCurrentTime(playerId: string): Promise<{ result: { method: string; value: number } }>;

  /**
   * Toggle fullscreen mode on or off.
   *
   * @param playerId - ID of the player
   * @param isFullScreen - true for fullscreen, false for normal, null/undefined to toggle
   * @returns Promise with the fullscreen state that was set
   */
  toggleFullScreen(
    playerId: string,
    isFullScreen: boolean | null | undefined,
  ): Promise<{ result: { method: string; value: boolean | null | undefined } }>;

  // ========================================
  // Playback Quality
  // ========================================

  /**
   * Get the current playback quality.
   *
   * @param playerId - ID of the player
   * @returns Promise with quality level (small, medium, large, hd720, hd1080, highres, default)
   */
  getPlaybackQuality(playerId: string): Promise<{ result: { method: string; value: IPlaybackQuality } }>;

  /**
   * Set the suggested playback quality.
   * Actual quality may differ based on network conditions.
   *
   * @param playerId - ID of the player
   * @param suggestedQuality - Desired quality level
   * @returns Promise with operation result
   */
  setPlaybackQuality(
    playerId: string,
    suggestedQuality: IPlaybackQuality,
  ): Promise<{ result: { method: string; value: boolean } }>;

  /**
   * Get list of available quality levels for current video.
   *
   * @param playerId - ID of the player
   * @returns Promise with array of available quality levels
   */
  getAvailableQualityLevels(playerId: string): Promise<{ result: { method: string; value: IPlaybackQuality[] } }>;

  // ========================================
  // Video Information
  // ========================================

  /**
   * Get the duration of the current video in seconds.
   *
   * @param playerId - ID of the player
   * @returns Promise with duration in seconds
   */
  getDuration(playerId: string): Promise<{ result: { method: string; value: number } }>;

  /**
   * Get the YouTube.com URL for the current video.
   *
   * @param playerId - ID of the player
   * @returns Promise with video URL
   */
  getVideoUrl(playerId: string): Promise<{ result: { method: string; value: string } }>;

  /**
   * Get the embed code for the current video.
   * Returns HTML iframe embed code.
   *
   * @param playerId - ID of the player
   * @returns Promise with iframe embed code
   */
  getVideoEmbedCode(playerId: string): Promise<{ result: { method: string; value: string } }>;

  // ========================================
  // Playlist Information
  // ========================================

  /**
   * Get array of video IDs in the current playlist.
   *
   * @param playerId - ID of the player
   * @returns Promise with array of video IDs
   */
  getPlaylist(playerId: string): Promise<{ result: { method: string; value: string[] } }>;

  /**
   * Get the index of the currently playing video in the playlist.
   *
   * @param playerId - ID of the player
   * @returns Promise with zero-based index
   */
  getPlaylistIndex(playerId: string): Promise<{ result: { method: string; value: number } }>;

  // ========================================
  // DOM Access
  // ========================================

  /**
   * Get the iframe DOM element for the player.
   * Web platform only.
   *
   * @param playerId - ID of the player
   * @returns Promise with iframe element
   */
  getIframe(playerId: string): Promise<{ result: { method: string; value: HTMLIFrameElement } }>;

  // ========================================
  // Event Listeners
  // ========================================

  /**
   * Add an event listener to the player.
   *
   * @param playerId - ID of the player
   * @param eventName - Name of the event (onReady, onStateChange, onError, etc.)
   * @param listener - Callback function to handle the event
   * @example
   * ```typescript
   * YoutubePlayer.addEventListener('my-player', 'onStateChange', (event) => {
   *   console.log('Player state:', event.data);
   * });
   * ```
   */
  addEventListener<TEvent extends PlayerEvent>(
    playerId: string,
    eventName: keyof Events,
    listener: (event: TEvent) => void,
  ): void;

  /**
   * Remove an event listener from the player.
   *
   * @param playerId - ID of the player
   * @param eventName - Name of the event to remove listener from
   * @param listener - The callback function to remove
   */
  removeEventListener<TEvent extends PlayerEvent>(
    playerId: string,
    eventName: keyof Events,
    listener: (event: TEvent) => void,
  ): void;

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
