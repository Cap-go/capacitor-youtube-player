# @capgo/capacitor-youtube-player
 <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>
Embed YouTube player controls in Capacitor apps

## Install

```bash
npm install @capgo/capacitor-youtube-player
npx cap sync
```

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

### initialize(...)

```typescript
initialize(options: IPlayerOptions) => Promise<{ playerReady: boolean; player: string; } | undefined>
```

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#iplayeroptions">IPlayerOptions</a></code> |

**Returns:** <code>Promise&lt;{ playerReady: boolean; player: string; }&gt;</code>

--------------------


### destroy(...)

```typescript
destroy(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### stopVideo(...)

```typescript
stopVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### playVideo(...)

```typescript
playVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### pauseVideo(...)

```typescript
pauseVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### seekTo(...)

```typescript
seekTo(playerId: string, seconds: number, allowSeekAhead: boolean) => Promise<{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean; }; }>
```

| Param                | Type                 |
| -------------------- | -------------------- |
| **`playerId`**       | <code>string</code>  |
| **`seconds`**        | <code>number</code>  |
| **`allowSeekAhead`** | <code>boolean</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; seconds: number; allowSeekAhead: boolean; }; }&gt;</code>

--------------------


### loadVideoById(...)

```typescript
loadVideoById(playerId: string, options: IVideoOptionsById) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById; }; }>
```

| Param          | Type                                                            |
| -------------- | --------------------------------------------------------------- |
| **`playerId`** | <code>string</code>                                             |
| **`options`**  | <code><a href="#ivideooptionsbyid">IVideoOptionsById</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyid">IVideoOptionsById</a>; }; }&gt;</code>

--------------------


### cueVideoById(...)

```typescript
cueVideoById(playerId: string, options: IVideoOptionsById) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsById; }; }>
```

| Param          | Type                                                            |
| -------------- | --------------------------------------------------------------- |
| **`playerId`** | <code>string</code>                                             |
| **`options`**  | <code><a href="#ivideooptionsbyid">IVideoOptionsById</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyid">IVideoOptionsById</a>; }; }&gt;</code>

--------------------


### loadVideoByUrl(...)

```typescript
loadVideoByUrl(playerId: string, options: IVideoOptionsByUrl) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl; }; }>
```

| Param          | Type                                                              |
| -------------- | ----------------------------------------------------------------- |
| **`playerId`** | <code>string</code>                                               |
| **`options`**  | <code><a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a>; }; }&gt;</code>

--------------------


### cueVideoByUrl(...)

```typescript
cueVideoByUrl(playerId: string, options: IVideoOptionsByUrl) => Promise<{ result: { method: string; value: boolean; options: IVideoOptionsByUrl; }; }>
```

| Param          | Type                                                              |
| -------------- | ----------------------------------------------------------------- |
| **`playerId`** | <code>string</code>                                               |
| **`options`**  | <code><a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; options: <a href="#ivideooptionsbyurl">IVideoOptionsByUrl</a>; }; }&gt;</code>

--------------------


### cuePlaylist(...)

```typescript
cuePlaylist(playerId: string, playlistOptions: IPlaylistOptions) => Promise<{ result: { method: string; value: boolean; }; }>
```

********

| Param                 | Type                                                          |
| --------------------- | ------------------------------------------------------------- |
| **`playerId`**        | <code>string</code>                                           |
| **`playlistOptions`** | <code><a href="#iplaylistoptions">IPlaylistOptions</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### loadPlaylist(...)

```typescript
loadPlaylist(playerId: string, playlistOptions: IPlaylistOptions) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param                 | Type                                                          |
| --------------------- | ------------------------------------------------------------- |
| **`playerId`**        | <code>string</code>                                           |
| **`playlistOptions`** | <code><a href="#iplaylistoptions">IPlaylistOptions</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### nextVideo(...)

```typescript
nextVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### previousVideo(...)

```typescript
previousVideo(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### playVideoAt(...)

```typescript
playVideoAt(playerId: string, index: number) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |
| **`index`**    | <code>number</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### mute(...)

```typescript
mute(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### unMute(...)

```typescript
unMute(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### isMuted(...)

```typescript
isMuted(playerId: string) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### setVolume(...)

```typescript
setVolume(playerId: string, volume: number) => Promise<{ result: { method: string; value: number; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |
| **`volume`**   | <code>number</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getVolume(...)

```typescript
getVolume(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### setSize(...)

```typescript
setSize(playerId: string, width: number, height: number) => Promise<{ result: { method: string; value: { width: number; height: number; }; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |
| **`width`**    | <code>number</code> |
| **`height`**   | <code>number</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: { width: number; height: number; }; }; }&gt;</code>

--------------------


### getPlaybackRate(...)

```typescript
getPlaybackRate(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### setPlaybackRate(...)

```typescript
setPlaybackRate(playerId: string, suggestedRate: number) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param               | Type                |
| ------------------- | ------------------- |
| **`playerId`**      | <code>string</code> |
| **`suggestedRate`** | <code>number</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### getAvailablePlaybackRates(...)

```typescript
getAvailablePlaybackRates(playerId: string) => Promise<{ result: { method: string; value: number[]; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number[]; }; }&gt;</code>

--------------------


### setLoop(...)

```typescript
setLoop(playerId: string, loopPlaylists: boolean) => Promise<{ result: { method: string; value: boolean; }; }>
```

********

| Param               | Type                 |
| ------------------- | -------------------- |
| **`playerId`**      | <code>string</code>  |
| **`loopPlaylists`** | <code>boolean</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### setShuffle(...)

```typescript
setShuffle(playerId: string, shufflePlaylist: boolean) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param                 | Type                 |
| --------------------- | -------------------- |
| **`playerId`**        | <code>string</code>  |
| **`shufflePlaylist`** | <code>boolean</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### getVideoLoadedFraction(...)

```typescript
getVideoLoadedFraction(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getPlayerState(...)

```typescript
getPlayerState(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getAllPlayersEventsState()

```typescript
getAllPlayersEventsState() => Promise<{ result: { method: string; value: Map<string, IPlayerState>; }; }>
```

**Returns:** <code>Promise&lt;{ result: { method: string; value: <a href="#map">Map</a>&lt;string, <a href="#iplayerstate">IPlayerState</a>&gt;; }; }&gt;</code>

--------------------


### getCurrentTime(...)

```typescript
getCurrentTime(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### toggleFullScreen(...)

```typescript
toggleFullScreen(playerId: string, isFullScreen: boolean | null | undefined) => Promise<{ result: { method: string; value: boolean | null | undefined; }; }>
```

| Param              | Type                         |
| ------------------ | ---------------------------- |
| **`playerId`**     | <code>string</code>          |
| **`isFullScreen`** | <code>boolean \| null</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean | null; }; }&gt;</code>

--------------------


### getPlaybackQuality(...)

```typescript
getPlaybackQuality(playerId: string) => Promise<{ result: { method: string; value: IPlaybackQuality; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: <a href="#iplaybackquality">IPlaybackQuality</a>; }; }&gt;</code>

--------------------


### setPlaybackQuality(...)

```typescript
setPlaybackQuality(playerId: string, suggestedQuality: IPlaybackQuality) => Promise<{ result: { method: string; value: boolean; }; }>
```

| Param                  | Type                                                          |
| ---------------------- | ------------------------------------------------------------- |
| **`playerId`**         | <code>string</code>                                           |
| **`suggestedQuality`** | <code><a href="#iplaybackquality">IPlaybackQuality</a></code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: boolean; }; }&gt;</code>

--------------------


### getAvailableQualityLevels(...)

```typescript
getAvailableQualityLevels(playerId: string) => Promise<{ result: { method: string; value: IPlaybackQuality[]; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: IPlaybackQuality[]; }; }&gt;</code>

--------------------


### getDuration(...)

```typescript
getDuration(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getVideoUrl(...)

```typescript
getVideoUrl(playerId: string) => Promise<{ result: { method: string; value: string; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: string; }; }&gt;</code>

--------------------


### getVideoEmbedCode(...)

```typescript
getVideoEmbedCode(playerId: string) => Promise<{ result: { method: string; value: string; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: string; }; }&gt;</code>

--------------------


### getPlaylist(...)

```typescript
getPlaylist(playerId: string) => Promise<{ result: { method: string; value: string[]; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: string[]; }; }&gt;</code>

--------------------


### getPlaylistIndex(...)

```typescript
getPlaylistIndex(playerId: string) => Promise<{ result: { method: string; value: number; }; }>
```

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: number; }; }&gt;</code>

--------------------


### getIframe(...)

```typescript
getIframe(playerId: string) => Promise<{ result: { method: string; value: HTMLIFrameElement; }; }>
```

********

| Param          | Type                |
| -------------- | ------------------- |
| **`playerId`** | <code>string</code> |

**Returns:** <code>Promise&lt;{ result: { method: string; value: any; }; }&gt;</code>

--------------------


### addEventListener(...)

```typescript
addEventListener<TEvent extends PlayerEvent>(playerId: string, eventName: keyof Events, listener: (event: TEvent) => void) => void
```

| Param           | Type                                            |
| --------------- | ----------------------------------------------- |
| **`playerId`**  | <code>string</code>                             |
| **`eventName`** | <code>keyof <a href="#events">Events</a></code> |
| **`listener`**  | <code>(event: TEvent) =&gt; void</code>         |

--------------------


### removeEventListener(...)

```typescript
removeEventListener<TEvent extends PlayerEvent>(playerId: string, eventName: keyof Events, listener: (event: TEvent) => void) => void
```

| Param           | Type                                            |
| --------------- | ----------------------------------------------- |
| **`playerId`**  | <code>string</code>                             |
| **`eventName`** | <code>keyof <a href="#events">Events</a></code> |
| **`listener`**  | <code>(event: TEvent) =&gt; void</code>         |

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<{ version: string; }>
```

Get the native Capacitor plugin version

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

--------------------


### Interfaces


#### IPlayerOptions

| Prop             | Type                                                |
| ---------------- | --------------------------------------------------- |
| **`playerId`**   | <code>string</code>                                 |
| **`playerSize`** | <code><a href="#iplayersize">IPlayerSize</a></code> |
| **`videoId`**    | <code>string</code>                                 |
| **`fullscreen`** | <code>boolean</code>                                |
| **`playerVars`** | <code><a href="#iplayervars">IPlayerVars</a></code> |
| **`debug`**      | <code>boolean</code>                                |


#### IPlayerSize

| Prop         | Type                |
| ------------ | ------------------- |
| **`height`** | <code>number</code> |
| **`width`**  | <code>number</code> |


#### IPlayerVars

| Prop                 | Type                |
| -------------------- | ------------------- |
| **`autoplay`**       | <code>number</code> |
| **`cc_load_policy`** | <code>number</code> |
| **`color`**          | <code>string</code> |
| **`controls`**       | <code>number</code> |
| **`disablekb`**      | <code>number</code> |
| **`enablejsapi`**    | <code>number</code> |
| **`end`**            | <code>number</code> |
| **`fs`**             | <code>number</code> |
| **`hl`**             | <code>string</code> |
| **`iv_load_policy`** | <code>number</code> |
| **`list`**           | <code>string</code> |
| **`listType`**       | <code>string</code> |
| **`loop`**           | <code>number</code> |
| **`modestbranding`** | <code>number</code> |
| **`origin`**         | <code>string</code> |
| **`playlist`**       | <code>string</code> |
| **`playsinline`**    | <code>number</code> |
| **`rel`**            | <code>number</code> |
| **`showinfo`**       | <code>number</code> |
| **`start`**          | <code>number</code> |


#### IVideoOptionsById

| Prop          | Type                |
| ------------- | ------------------- |
| **`videoId`** | <code>string</code> |


#### IVideoOptionsByUrl

| Prop                  | Type                |
| --------------------- | ------------------- |
| **`mediaContentUrl`** | <code>string</code> |


#### IPlaylistOptions

| Prop                   | Type                                                  |
| ---------------------- | ----------------------------------------------------- |
| **`listType`**         | <code>'playlist' \| 'search' \| 'user_uploads'</code> |
| **`list`**             | <code>string</code>                                   |
| **`playlist`**         | <code>string[]</code>                                 |
| **`index`**            | <code>number</code>                                   |
| **`startSeconds`**     | <code>number</code>                                   |
| **`suggestedQuality`** | <code>string</code>                                   |


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

| Prop         | Type                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **`events`** | <code>{ onReady?: unknown; onStateChange?: unknown; onPlaybackQualityChange?: unknown; onError?: unknown; }</code> |


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

| Members        | Value                  |
| -------------- | ---------------------- |
| **`SMALL`**    | <code>'small'</code>   |
| **`MEDIUM`**   | <code>'medium'</code>  |
| **`LARGE`**    | <code>'large'</code>   |
| **`HD720`**    | <code>'hd720'</code>   |
| **`HD1080`**   | <code>'hd1080'</code>  |
| **`HIGH_RES`** | <code>'highres'</code> |
| **`DEFAULT`**  | <code>'default'</code> |


#### PlayerState

| Members         | Value           |
| --------------- | --------------- |
| **`UNSTARTED`** | <code>-1</code> |
| **`ENDED`**     | <code>0</code>  |
| **`PLAYING`**   | <code>1</code>  |
| **`PAUSED`**    | <code>2</code>  |
| **`BUFFERING`** | <code>3</code>  |
| **`CUED`**      | <code>5</code>  |


#### PlayerError

| Members                    | Value            | Description                                                                          |
| -------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| **`InvalidParam`**         | <code>2</code>   | The request contained an invalid parameter value.                                    |
| **`Html5Error`**           | <code>5</code>   | The requested content cannot be played in an HTML5 player.                           |
| **`VideoNotFound`**        | <code>100</code> | The video requested was not found.                                                   |
| **`EmbeddingNotAllowed`**  | <code>101</code> | The owner of the requested video does not allow it to be played in embedded players. |
| **`EmbeddingNotAllowed2`** | <code>150</code> | This error is the same as 101. It's just a 101 error in disguise!                    |

</docgen-api>
