import { registerPlugin } from '@capacitor/core';

import type { YoutubePlayerPlugin } from './definitions';

const YoutubePlayer = registerPlugin<YoutubePlayerPlugin>('YoutubePlayer', {
  web: () => import('./web').then((m) => new m.YoutubePlayerPluginWeb()),
});

export * from './definitions';
export * from './events';
export { MIN_PLAYER_DIMENSION, MIN_PLAYER_SIZE_ERROR, validatePlayerFrame, validatePlayerSize } from './validation';
export { YoutubePlayer };
