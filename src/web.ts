import { WebPlugin } from '@capacitor/core';

import type { YoutubePlayerPlugin } from './definitions';

export class YoutubePlayerWeb extends WebPlugin implements YoutubePlayerPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
