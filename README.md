# @capgo/capacitor-youtube-player
 <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>
Embed YouTube player controls in Capacitor apps

## Documentation

The most complete doc is available here: https://capgo.app/docs/plugins/youtube-player/

## Install

```bash
npm install @capgo/capacitor-youtube-player
npx cap sync
```

## Native Implementation

### iOS
This plugin uses [YoutubeKit](https://github.com/rinov/YoutubeKit) for native iOS playback, which provides:
- **Fullscreen-only playback mode** for immersive viewing experience
- WKWebView-based YouTube iframe player
- Support for YouTube iframe API parameters
- Native iOS presentation
- Cookie support for authentication
- CocoaPods and Swift Package Manager support

The dependency is automatically included via Swift Package Manager or CocoaPods.

**Important:** iOS always plays videos in fullscreen mode for the best user experience.

### Android
Uses the YouTube Android Player API (note: deprecated by Google in May 2023, but still functional).

## Privacy & GDPR Compliance

This plugin now supports **privacy-enhanced mode** for better GDPR compliance. When enabled, the plugin uses `youtube-nocookie.com` domain instead of `youtube.com`, which prevents YouTube from storing visitor information until they actually play the video.

### Usage with Privacy-Enhanced Mode

```typescript
import { YoutubePlayer } from '@capgo/capacitor-youtube-player';

await YoutubePlayer.initialize({
  playerId: 'my-player',
  videoId: 'dQw4w9WgXcQ',
  playerSize: { width: 640, height: 360 },
  privacyEnhanced: true  // Enable privacy-enhanced mode
});
```

**Important Platform Notes:**
- **Web**: The `privacyEnhanced` option uses `youtube-nocookie.com` domain for better privacy
- **iOS**: Uses [YoutubeKit](https://github.com/rinov/YoutubeKit) for native fullscreen-only playback with WKWebView-based rendering
- **Android**: Uses the deprecated YouTube Android Player API (deprecated May 2023) which does NOT support privacy-enhanced mode

**For full GDPR compliance, you should also:**
- Display a cookie consent banner before loading videos
- Update your privacy policy to disclose YouTube's data collection
- Consider implementing a "click to load" placeholder for videos
- For native Android apps with strict privacy requirements, consider using the web platform until native WebView-based implementation is available

## Cookie Support (Preventing Bot Detection)

The plugin now supports passing cookies to the YouTube player to help prevent the "sign in to confirm you're not a bot" message that YouTube sometimes displays.

### Usage with Cookies

```typescript
import { YoutubePlayer } from '@capgo/capacitor-youtube-player';

await YoutubePlayer.initialize({
  playerId: 'my-player',
  videoId: 'dQw4w9WgXcQ',
  playerSize: { width: 640, height: 360 },
  cookies: 'CONSENT=YES+cb; VISITOR_INFO1_LIVE=xyz123'  // Your YouTube cookies
});
```

**Platform Support:**
- **Web**: ✅ Cookies are set via `document.cookie` with `SameSite=None; Secure` attributes
- **iOS**: ✅ Cookies are set in WKWebView's HTTPCookieStore for the `.youtube.com` domain (uses YoutubeKit internally, fullscreen-only mode)
- **Android**: ✅ Cookies are set via CookieManager in the WebView for YouTube domains

**Important Notes:**
- **Cookie Format**: Pass cookies as a semicolon-separated string (e.g., `"name1=value1; name2=value2"`)
- **Getting Cookies**: You can obtain valid YouTube cookies from your browser's developer tools when signed into YouTube
- **Security**: All cookies are automatically set with secure attributes (HTTPS only)
- **Domain**: Cookies are set for `.youtube.com` to work across all YouTube subdomains
- **Android Limitation**: The native YouTube Player API has its own session management, so cookies set in the WebView may not directly affect the native player UI. However, they will be available for any web-based YouTube content.

**Common YouTube Cookies:**
- `CONSENT`: YouTube consent cookie (helps with GDPR compliance)
- `VISITOR_INFO1_LIVE`: Visitor tracking cookie
- `YSC`: YouTube session cookie
- `PREF`: User preferences cookie

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`destroy(...)`](#destroy)
* [`stopVideo(...)`](#stopvideo)
* [`playVideo(...)`](#playvideo)
* [`pauseVideo(...)`](#pausevideo)
* [`seekTo(...)`](#seekto)
* [`loadVideoById(...)`](#loadvideobyid)
* [`cueVideoById(...)`](#cuevideobyid)
* [`loadVideoByUrl(...)`](#loadvideobyurl)
* [`cueVideoByUrl(...)`](#cuevideobyurl)
* [`cuePlaylist(...)`](#cueplaylist)
* [`loadPlaylist(...)`](#loadplaylist)
* [`nextVideo(...)`](#nextvideo)
* [`previousVideo(...)`](#previousvideo)
* [`playVideoAt(...)`](#playvideoat)
* [`mute(...)`](#mute)
* [`unMute(...)`](#unmute)
* [`isMuted(...)`](#ismuted)
* [`setVolume(...)`](#setvolume)
* [`getVolume(...)`](#getvolume)
* [`setSize(...)`](#setsize)
* [`getPlaybackRate(...)`](#getplaybackrate)
* [`setPlaybackRate(...)`](#setplaybackrate)
* [`getAvailablePlaybackRates(...)`](#getavailableplaybackrates)
* [`setLoop(...)`](#setloop)
* [`setShuffle(...)`](#setshuffle)
* [`getVideoLoadedFraction(...)`](#getvideoloadedfraction)
* [`getPlayerState(...)`](#getplayerstate)
* [`getAllPlayersEventsState()`](#getallplayerseventsstate)
* [`getCurrentTime(...)`](#getcurrenttime)
* [`toggleFullScreen(...)`](#togglefullscreen)
* [`getPlaybackQuality(...)`](#getplaybackquality)
* [`setPlaybackQuality(...)`](#setplaybackquality)
* [`getAvailableQualityLevels(...)`](#getavailablequalitylevels)
* [`getDuration(...)`](#getduration)
* [`getVideoUrl(...)`](#getvideourl)
* [`getVideoEmbedCode(...)`](#getvideoembedcode)
* [`getPlaylist(...)`](#getplaylist)
* [`getPlaylistIndex(...)`](#getplaylistindex)
* [`getIframe(...)`](#getiframe)
* [`addEventListener(...)`](#addeventlistener)
* [`removeEventListener(...)`](#removeeventlistener)
* [`getPluginVersion()`](#getpluginversion)
* [Interfaces](#interfaces)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

YouTube Player Plugin interface for Capacitor.
Provides methods to control YouTube video playback in your app.

### initialize(...)

```typescript
initialize(options: IPlayerOptions) => Promise<{ playerReady: boolean; player: string; } | undefined>
```

Initialize a new YouTube player instance.

| Param         | Type                                                      | Description                            |
| ------------- | --------------------------------------------------------- | -------------------------------------- |
| **`options`** | <code><a href="#iplayeroptions">IPlayerOptions</a></code> | - Configuration options for the player |

**Returns:** <code>Promise&lt;{ playerReady: boolean; player: string; }&gt;</code>

--------------------


### destroy(...)

```typescript
destroy(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Destroy a player instance and free resources.

| Param          | Type                | Description                   |
| -------------- | ------------------- | ----------------------------- |
| **`playerId`** | <code>string</code> | - ID of the player to destroy |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### stopVideo(...)

```typescript
stopVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Stop video playback and cancel loading.
Use this sparingly - pauseVideo() is usually preferred.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### playVideo(...)

```typescript
playVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Play the currently cued or loaded video.
Final player state will be PLAYING (1).

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### pauseVideo(...)

```typescript
pauseVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Pause the currently playing video.
Final player state will be PAUSED (2), unless already ENDED (0).

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### seekTo(...)

```typescript
seekTo(playerId: string, seconds: number, allowSeekAhead: boolean) => Promise<{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean; }; }>
```

Seek to a specific time in the video.
If player is paused, it remains paused. If playing, continues playing.

| Param                | Type                 | Description                                               |
| -------------------- | -------------------- | --------------------------------------------------------- |
| **`playerId`**       | <code>string</code>  | - ID of the player                                        |
| **`seconds`**        | <code>number</code>  | - Time to seek to (in seconds)                            |
| **`allowSeekAhead`** | <code>boolean</code> | - Whether to make a new request to server if not buffered |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean; }; }&gt;</code>

--------------------


### loadVideoById(...)

```typescript
loadVideoById(playerId: string, options: IVideoOptionsById) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById; }; }>
```

Load and play a video by its YouTube ID.

| Param          | Type                                                            | Description                                             |
| -------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| **`playerId`** | <code>string</code>                                             | - ID of the player                                      |
| **`options`**  | <code><a href="#ivideooptionsbyid">IVideoOptionsById</a></code> | - Video loading options (ID, start time, quality, etc.) |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyid">IVideoOptionsById</a>; }; }&gt;</code>

--------------------


### cueVideoById(...)

```typescript
cueVideoById(playerId: string, options: IVideoOptionsById) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById; }; }>
```

Cue a video by ID without playing it.
Loads thumbnail and prepares player, but doesn't request video until playVideo() called.

| Param          | Type                                                            | Description                                           |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **`playerId`** | <code>string</code>                                             | - ID of the player                                    |
| **`options`**  | <code><a href="#ivideooptionsbyid">IVideoOptionsById</a></code> | - Video cuing options (ID, start time, quality, etc.) |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyid">IVideoOptionsById</a>; }; }&gt;</code>

--------------------


### loadVideoByUrl(...)

```typescript
loadVideoByUrl(playerId: string, options: IVideoOptionsByUrl) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl; }; }>
```

Load and play a video by its full URL.

| Param          | Type                                                              | Description                                 |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| **`playerId`** | <code>string</code>                                               | - ID of the player                          |
| **`options`**  | <code><a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a></code> | - Video loading options including media URL |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a>; }; }&gt;</code>

--------------------


### cueVideoByUrl(...)

```typescript
cueVideoByUrl(playerId: string, options: IVideoOptionsByUrl) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl; }; }>
```

Cue a video by URL without playing it.

| Param          | Type                                                              | Description                               |
| -------------- | ----------------------------------------------------------------- | ----------------------------------------- |
| **`playerId`** | <code>string</code>                                               | - ID of the player                        |
| **`options`**  | <code><a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a></code> | - Video cuing options including media URL |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a>; }; }&gt;</code>

--------------------


### cuePlaylist(...)

```typescript
cuePlaylist(playerId: string, playlistOptions: IPlaylistOptions) => Promise<{ result: { method: string; value: boolean; }; }>
```

Cue a playlist without playing it.
Loads playlist and prepares first video.

| Param                 | Type                                                          | Description                                      |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **`playerId`**        | <code>string</code>                                           | - ID of the player                               |
| **`playlistOptions`** | <code><a href="#iplaylistoptions">IPlaylistOptions</a></code> | - Playlist configuration (type, ID, index, etc.) |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### loadPlaylist(...)

```typescript
loadPlaylist(playerId: string, playlistOptions: IPlaylistOptions) => Promise<{ result: { method: string; value: boolean; }; }>
```

Load and play a playlist.

| Param                 | Type                                                          | Description                                      |
| --------------------- | ------------------------------------------------------------- | ------------------------------------------------ |
| **`playerId`**        | <code>string</code>                                           | - ID of the player                               |
| **`playlistOptions`** | <code><a href="#iplaylistoptions">IPlaylistOptions</a></code> | - Playlist configuration (type, ID, index, etc.) |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### nextVideo(...)

```typescript
nextVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Play the next video in the playlist.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### previousVideo(...)

```typescript
previousVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Play the previous video in the playlist.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### playVideoAt(...)

```typescript
playVideoAt(playerId: string, index: number) => Promise<{ result: { method: string; value: boolean; }; }>
```

Play a specific video in the playlist by index.

| Param          | Type                | Description                             |
| -------------- | ------------------- | --------------------------------------- |
| **`playerId`** | <code>string</code> | - ID of the player                      |
| **`index`**    | <code>number</code> | - Zero-based index of the video to play |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### mute(...)

```typescript
mute(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Mute the player audio.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### unMute(...)

```typescript
unMute(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Unmute the player audio.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### isMuted(...)

```typescript
isMuted(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

Check if the player is currently muted.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### setVolume(...)

```typescript
setVolume(playerId: string, volume: number) => Promise<{ result: { method: string; value: number; }; }>
```

Set the player volume level.

| Param          | Type                | Description                                 |
| -------------- | ------------------- | ------------------------------------------- |
| **`playerId`** | <code>string</code> | - ID of the player                          |
| **`volume`**   | <code>number</code> | - Volume level from 0 (silent) to 100 (max) |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getVolume(...)

```typescript
getVolume(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the current player volume level.
Returns volume even if player is muted.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### setSize(...)

```typescript
setSize(playerId: string, width: number, height: number) => Promise<{ result: { method: string; value: { width: number; height: number; }; }; }>
```

Set the player dimensions in pixels.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |
| **`width`**    | <code>number</code> | - Width in pixels  |
| **`height`**   | <code>number</code> | - Height in pixels |

**Returns:** <code>Promise&lt;{ result: { method: string; value: { width: number; height: number; }; }; }&gt;</code>

--------------------


### getPlaybackRate(...)

```typescript
getPlaybackRate(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the current playback rate.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### setPlaybackRate(...)

```typescript
setPlaybackRate(playerId: string, suggestedRate: number) => Promise<{ result: { method: string; value: boolean; }; }>
```

Set the playback speed.

| Param               | Type                | Description                           |
| ------------------- | ------------------- | ------------------------------------- |
| **`playerId`**      | <code>string</code> | - ID of the player                    |
| **`suggestedRate`** | <code>number</code> | - Desired playback rate (0.25 to 2.0) |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### getAvailablePlaybackRates(...)

```typescript
getAvailablePlaybackRates(playerId: string) => Promise<{ result: { method: string; value: number[]; }; }>
```

Get list of available playback rates for current video.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number[]; }; }&gt;</code>

--------------------


### setLoop(...)

```typescript
setLoop(playerId: string, loopPlaylists: boolean) => Promise<{ result: { method: string; value: boolean; }; }>
```

Enable or disable playlist looping.
When enabled, playlist will restart from beginning after last video.

| Param               | Type                 | Description                                    |
| ------------------- | -------------------- | ---------------------------------------------- |
| **`playerId`**      | <code>string</code>  | - ID of the player                             |
| **`loopPlaylists`** | <code>boolean</code> | - true to loop, false to stop after last video |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### setShuffle(...)

```typescript
setShuffle(playerId: string, shufflePlaylist: boolean) => Promise<{ result: { method: string; value: boolean; }; }>
```

Enable or disable playlist shuffle.

| Param                 | Type                 | Description                             |
| --------------------- | -------------------- | --------------------------------------- |
| **`playerId`**        | <code>string</code>  | - ID of the player                      |
| **`shufflePlaylist`** | <code>boolean</code> | - true to shuffle, false for sequential |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### getVideoLoadedFraction(...)

```typescript
getVideoLoadedFraction(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the fraction of the video that has been buffered.
More reliable than deprecated getVideoBytesLoaded/getVideoBytesTotal.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getPlayerState(...)

```typescript
getPlayerState(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the current state of the player.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getAllPlayersEventsState()

```typescript
getAllPlayersEventsState() => Promise<{ result: { method: string; value: Map<string, IPlayerState>; }; }>
```

Get event states for all active players.
Useful for tracking multiple player instances.

**Returns:** <code>Promise&lt;{ result: { method: string; value: <a href="#map">Map</a>&lt;string, <a href="#iplayerstate">IPlayerState</a>&gt;; }; }&gt;</code>

--------------------


### getCurrentTime(...)

```typescript
getCurrentTime(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the current playback position in seconds.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### toggleFullScreen(...)

```typescript
toggleFullScreen(playerId: string, isFullScreen: boolean | null | undefined) => Promise<{ result: { method: string; value: boolean | null | undefined; }; }>
```

Toggle fullscreen mode on or off.

| Param              | Type                         | Description                                                       |
| ------------------ | ---------------------------- | ----------------------------------------------------------------- |
| **`playerId`**     | <code>string</code>          | - ID of the player                                                |
| **`isFullScreen`** | <code>boolean \| null</code> | - true for fullscreen, false for normal, null/undefined to toggle |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean | null; }; }&gt;</code>

--------------------


### getPlaybackQuality(...)

```typescript
getPlaybackQuality(playerId: string) => Promise<{ result: { method: string; value: IPlaybackQuality; }; }>
```

Get the current playback quality.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: <a href="#iplaybackquality">IPlaybackQuality</a>; }; }&gt;</code>

--------------------


### setPlaybackQuality(...)

```typescript
setPlaybackQuality(playerId: string, suggestedQuality: IPlaybackQuality) => Promise<{ result: { method: string; value: boolean; }; }>
```

Set the suggested playback quality.
Actual quality may differ based on network conditions.

| Param                  | Type                                                          | Description             |
| ---------------------- | ------------------------------------------------------------- | ----------------------- |
| **`playerId`**         | <code>string</code>                                           | - ID of the player      |
| **`suggestedQuality`** | <code><a href="#iplaybackquality">IPlaybackQuality</a></code> | - Desired quality level |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### getAvailableQualityLevels(...)

```typescript
getAvailableQualityLevels(playerId: string) => Promise<{ result: { method: string; value: IPlaybackQuality[]; }; }>
```

Get list of available quality levels for current video.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: IPlaybackQuality[]; }; }&gt;</code>

--------------------


### getDuration(...)

```typescript
getDuration(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the duration of the current video in seconds.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getVideoUrl(...)

```typescript
getVideoUrl(playerId: string) => Promise<{ result: { method: string; value: string; }; }>
```

Get the YouTube.com URL for the current video.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: string; }; }&gt;</code>

--------------------


### getVideoEmbedCode(...)

```typescript
getVideoEmbedCode(playerId: string) => Promise<{ result: { method: string; value: string; }; }>
```

Get the embed code for the current video.
Returns HTML iframe embed code.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: string; }; }&gt;</code>

--------------------


### getPlaylist(...)

```typescript
getPlaylist(playerId: string) => Promise<{ result: { method: string; value: string[]; }; }>
```

Get array of video IDs in the current playlist.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: string[]; }; }&gt;</code>

--------------------


### getPlaylistIndex(...)

```typescript
getPlaylistIndex(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

Get the index of the currently playing video in the playlist.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getIframe(...)

```typescript
getIframe(playerId: string) => Promise<{ result: { method: string; value: HTMLIFrameElement; }; }>
```

Get the iframe DOM element for the player.
Web platform only.

| Param          | Type                | Description        |
| -------------- | ------------------- | ------------------ |
| **`playerId`** | <code>string</code> | - ID of the player |

**Returns:** <code>Promise&lt;{ result: { method: string; value: any; }; }&gt;</code>

--------------------


### addEventListener(...)

```typescript
addEventListener<TEvent extends PlayerEvent>(playerId: string, eventName: keyof Events, listener: (event: TEvent) => void) => void
```

Add an event listener to the player.

| Param           | Type                                            | Description                                                 |
| --------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| **`playerId`**  | <code>string</code>                             | - ID of the player                                          |
| **`eventName`** | <code>keyof <a href="#events">Events</a></code> | - Name of the event (onReady, onStateChange, onError, etc.) |
| **`listener`**  | <code>(event: TEvent) =&gt; void</code>         | - Callback function to handle the event                     |

--------------------


### removeEventListener(...)

```typescript
removeEventListener<TEvent extends PlayerEvent>(playerId: string, eventName: keyof Events, listener: (event: TEvent) => void) => void
```

Remove an event listener from the player.

| Param           | Type                                            | Description                                 |
| --------------- | ----------------------------------------------- | ------------------------------------------- |
| **`playerId`**  | <code>string</code>                             | - ID of the player                          |
| **`eventName`** | <code>keyof <a href="#events">Events</a></code> | - Name of the event to remove listener from |
| **`listener`**  | <code>(event: TEvent) =&gt; void</code>         | - The callback function to remove           |

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<{ version: string; }>
```

Get the plugin version number.
Returns platform-specific version information.

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

--------------------


### Interfaces


#### IPlayerOptions

Configuration options for initializing a YouTube player instance.
All size and playback settings are configured through this interface.

| Prop                  | Type                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                       | Default                |
| --------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **`playerId`**        | <code>string</code>                                 | Unique identifier for the player instance. Used to reference this player in API calls.                                                                                                                                                                                                                                                                                                                                            |                        |
| **`playerSize`**      | <code><a href="#iplayersize">IPlayerSize</a></code> | Dimensions of the player in pixels.                                                                                                                                                                                                                                                                                                                                                                                               |                        |
| **`videoId`**         | <code>string</code>                                 | YouTube video ID to load.                                                                                                                                                                                                                                                                                                                                                                                                         |                        |
| **`fullscreen`**      | <code>boolean</code>                                | Whether to start the video in fullscreen mode.                                                                                                                                                                                                                                                                                                                                                                                    | <code>false</code>     |
| **`playerVars`**      | <code><a href="#iplayervars">IPlayerVars</a></code> | YouTube player parameters to customize playback behavior. See: https://developers.google.com/youtube/player_parameters                                                                                                                                                                                                                                                                                                            |                        |
| **`debug`**           | <code>boolean</code>                                | Enable debug logging for troubleshooting.                                                                                                                                                                                                                                                                                                                                                                                         | <code>false</code>     |
| **`privacyEnhanced`** | <code>boolean</code>                                | Use privacy-enhanced mode (youtube-nocookie.com) for better GDPR compliance. When enabled, YouTube won't store information about visitors on your website unless they play the video. **Note:** Only applies to web platform. Native platforms use different APIs.                                                                                                                                                                | <code>false</code>     |
| **`cookies`**         | <code>string</code>                                 | Cookies to be set for the YouTube player. This can help bypass the "sign in to confirm you're not a bot" message. Pass cookies as a semicolon-separated string (e.g., "name1=value1; name2=value2"). **Platform Support:** - Web: Sets cookies via document.cookie - iOS: Sets cookies in WKWebView's HTTPCookieStore - Android: Sets cookies via CookieManager (note: native YouTube Player API has separate session management) | <code>undefined</code> |


#### IPlayerSize

Player dimensions in pixels.

| Prop         | Type                | Description      |
| ------------ | ------------------- | ---------------- |
| **`height`** | <code>number</code> | Height in pixels |
| **`width`**  | <code>number</code> | Width in pixels  |


#### IPlayerVars

YouTube player parameters for customizing player behavior and appearance.

| Prop                 | Type                | Description                                                            |
| -------------------- | ------------------- | ---------------------------------------------------------------------- |
| **`autoplay`**       | <code>number</code> | Whether to autoplay the video (0 = no, 1 = yes)                        |
| **`cc_load_policy`** | <code>number</code> | Force closed captions to show by default (1 = show)                    |
| **`color`**          | <code>string</code> | Player controls color ('red' or 'white')                               |
| **`controls`**       | <code>number</code> | Whether to show player controls (0 = hide, 1 = show, 2 = show on load) |
| **`disablekb`**      | <code>number</code> | Disable keyboard controls (0 = enable, 1 = disable)                    |
| **`enablejsapi`**    | <code>number</code> | Enable JavaScript API (1 = enable)                                     |
| **`end`**            | <code>number</code> | Time in seconds to stop playback                                       |
| **`fs`**             | <code>number</code> | Show fullscreen button (0 = hide, 1 = show)                            |
| **`hl`**             | <code>string</code> | Player interface language (ISO 639-1 code)                             |
| **`iv_load_policy`** | <code>number</code> | Show video annotations (1 = show, 3 = hide)                            |
| **`list`**           | <code>string</code> | Playlist or content ID to load                                         |
| **`listType`**       | <code>string</code> | Type of content in 'list' parameter                                    |
| **`loop`**           | <code>number</code> | Loop the video (0 = no, 1 = yes, requires playlist)                    |
| **`modestbranding`** | <code>number</code> | Hide YouTube logo (0 = show, 1 = hide)                                 |
| **`origin`**         | <code>string</code> | Domain origin for extra security                                       |
| **`playlist`**       | <code>string</code> | Comma-separated list of video IDs to play                              |
| **`playsinline`**    | <code>number</code> | Play inline on iOS (0 = fullscreen, 1 = inline)                        |
| **`rel`**            | <code>number</code> | Show related videos (0 = from same channel, 1 = any)                   |
| **`showinfo`**       | <code>number</code> | Show video information (deprecated, always hidden)                     |
| **`start`**          | <code>number</code> | Time in seconds to start playback                                      |


#### IVideoOptionsById

Options for loading a video by its YouTube ID.

| Prop          | Type                | Description      |
| ------------- | ------------------- | ---------------- |
| **`videoId`** | <code>string</code> | YouTube video ID |


#### IVideoOptionsByUrl

Options for loading a video by its media URL.

| Prop                  | Type                | Description            |
| --------------------- | ------------------- | ---------------------- |
| **`mediaContentUrl`** | <code>string</code> | Full YouTube video URL |


#### IPlaylistOptions

Options for loading and playing YouTube playlists.

| Prop                   | Type                                                  | Description                                         |
| ---------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| **`listType`**         | <code>'playlist' \| 'search' \| 'user_uploads'</code> | Type of playlist to load                            |
| **`list`**             | <code>string</code>                                   | Playlist ID or search query (depending on listType) |
| **`playlist`**         | <code>string[]</code>                                 | Array of video IDs to play as a playlist            |
| **`index`**            | <code>number</code>                                   | Index of the video to start with (0-based)          |
| **`startSeconds`**     | <code>number</code>                                   | Time in seconds to start the first video            |
| **`suggestedQuality`** | <code>string</code>                                   | Suggested playback quality                          |


#### Map

| Prop       | Type                |
| ---------- | ------------------- |
| **`size`** | <code>number</code> |

| Method      | Signature                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| **clear**   | () =&gt; void                                                                                                  |
| **delete**  | (key: K) =&gt; boolean                                                                                         |
| **forEach** | (callbackfn: (value: V, key: K, map: <a href="#map">Map</a>&lt;K, V&gt;) =&gt; void, thisArg?: any) =&gt; void |
| **get**     | (key: K) =&gt; V \| undefined                                                                                  |
| **has**     | (key: K) =&gt; boolean                                                                                         |
| **set**     | (key: K, value: V) =&gt; this                                                                                  |


#### IPlayerState

Internal state tracking for player events.
Used to monitor which events have been triggered.

| Prop         | Type                                                                                                               | Description                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| **`events`** | <code>{ onReady?: unknown; onStateChange?: unknown; onPlaybackQualityChange?: unknown; onError?: unknown; }</code> | Event handlers and their states |


#### PlayerEvent

Base interface for events triggered by a player.

| Prop         | Type                 | Description                              |
| ------------ | -------------------- | ---------------------------------------- |
| **`target`** | <code>Element</code> | Video player corresponding to the event. |


#### Events

* Handlers for events fired by the player.

| Prop                          | Type                                                                                                                                              | Description                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`onReady`**                 | <code><a href="#playereventhandler">PlayerEventHandler</a>&lt;<a href="#playerevent">PlayerEvent</a>&gt;</code>                                   | Event fired when a player has finished loading and is ready to begin receiving API calls.                                                             |
| **`onStateChange`**           | <code><a href="#playereventhandler">PlayerEventHandler</a>&lt;<a href="#onstatechangeevent">OnStateChangeEvent</a>&gt;</code>                     | Event fired when the player's state changes.                                                                                                          |
| **`onPlaybackQualityChange`** | <code><a href="#playereventhandler">PlayerEventHandler</a>&lt;<a href="#onplaybackqualitychangeevent">OnPlaybackQualityChangeEvent</a>&gt;</code> | Event fired when the playback quality of the player changes.                                                                                          |
| **`onPlaybackRateChange`**    | <code><a href="#playereventhandler">PlayerEventHandler</a>&lt;<a href="#onplaybackratechangeevent">OnPlaybackRateChangeEvent</a>&gt;</code>       | Event fired when the playback rate of the player changes.                                                                                             |
| **`onError`**                 | <code><a href="#playereventhandler">PlayerEventHandler</a>&lt;<a href="#onerrorevent">OnErrorEvent</a>&gt;</code>                                 | Event fired when an error in the player occurs                                                                                                        |
| **`onApiChange`**             | <code><a href="#playereventhandler">PlayerEventHandler</a>&lt;<a href="#playerevent">PlayerEvent</a>&gt;</code>                                   | Event fired to indicate that the player has loaded, or unloaded, a module with exposed API methods. This currently only occurs for closed captioning. |


#### PlayerEventHandler

Handles a player event.


#### OnStateChangeEvent

Event for player state change.

| Prop       | Type                                                | Description       |
| ---------- | --------------------------------------------------- | ----------------- |
| **`data`** | <code><a href="#playerstate">PlayerState</a></code> | New player state. |


#### OnPlaybackQualityChangeEvent

Event for playback quality change.

| Prop       | Type                | Description           |
| ---------- | ------------------- | --------------------- |
| **`data`** | <code>string</code> | New playback quality. |


#### OnPlaybackRateChangeEvent

Event for playback rate change.

| Prop       | Type                | Description        |
| ---------- | ------------------- | ------------------ |
| **`data`** | <code>number</code> | New playback rate. |


#### OnErrorEvent

Event for a player error.

| Prop       | Type                                                | Description                   |
| ---------- | --------------------------------------------------- | ----------------------------- |
| **`data`** | <code><a href="#playererror">PlayerError</a></code> | Which type of error occurred. |


### Enums


#### IPlaybackQuality

| Members        | Value                  | Description                           |
| -------------- | ---------------------- | ------------------------------------- |
| **`SMALL`**    | <code>'small'</code>   | Small quality (240p)                  |
| **`MEDIUM`**   | <code>'medium'</code>  | Medium quality (360p)                 |
| **`LARGE`**    | <code>'large'</code>   | Large quality (480p)                  |
| **`HD720`**    | <code>'hd720'</code>   | High definition 720p                  |
| **`HD1080`**   | <code>'hd1080'</code>  | High definition 1080p                 |
| **`HIGH_RES`** | <code>'highres'</code> | Highest resolution available (1440p+) |
| **`DEFAULT`**  | <code>'default'</code> | Default quality selected by YouTube   |


#### PlayerState

| Members         | Value           | Description                         |
| --------------- | --------------- | ----------------------------------- |
| **`UNSTARTED`** | <code>-1</code> | Video has not started (-1)          |
| **`ENDED`**     | <code>0</code>  | Video has ended (0)                 |
| **`PLAYING`**   | <code>1</code>  | Video is currently playing (1)      |
| **`PAUSED`**    | <code>2</code>  | Video is paused (2)                 |
| **`BUFFERING`** | <code>3</code>  | Video is buffering (3)              |
| **`CUED`**      | <code>5</code>  | Video is cued and ready to play (5) |


#### PlayerError

| Members                    | Value            | Description                                                                          |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| **`InvalidParam`**         | <code>2</code>   | The request contained an invalid parameter value.                                    |
| **`Html5Error`**           | <code>5</code>   | The requested content cannot be played in an HTML5 player.                           |
| **`VideoNotFound`**        | <code>100</code> | The video requested was not found.                                                   |
| **`EmbeddingNotAllowed`**  | <code>101</code> | The owner of the requested video does not allow it to be played in embedded players. |
| **`EmbeddingNotAllowed2`** | <code>150</code> | This error is the same as 101. It's just a 101 error in disguise!                    |

</docgen-api>
