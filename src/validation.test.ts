import { describe, expect, test } from 'bun:test';

import { YOUTUBE_PLAYER_EVENTS } from './events';
import {
  MIN_PLAYER_DIMENSION,
  MIN_PLAYER_SIZE_ERROR,
  resolvePlayerFrame,
  validatePlayerFrame,
  validatePlayerSize,
} from './validation';

describe('validatePlayerSize', () => {
  test('accepts 200x200', () => {
    expect(() => validatePlayerSize(200, 200)).not.toThrow();
  });

  test('rejects smaller than minimum', () => {
    expect(() => validatePlayerSize(199, 200)).toThrow(MIN_PLAYER_SIZE_ERROR);
    expect(() => validatePlayerSize(200, 199)).toThrow(MIN_PLAYER_SIZE_ERROR);
  });
});

describe('validatePlayerFrame', () => {
  test('accepts valid frame', () => {
    expect(() => validatePlayerFrame({ x: 0, y: 10, width: 320, height: 240 })).not.toThrow();
  });

  test('rejects undersized frame', () => {
    expect(() => validatePlayerFrame({ x: 0, y: 0, width: 100, height: 200 })).toThrow(MIN_PLAYER_SIZE_ERROR);
  });
});

describe('resolvePlayerFrame', () => {
  test('prefers explicit frame', () => {
    const frame = resolvePlayerFrame({ x: 5, y: 6, width: 300, height: 250 }, { width: 640, height: 360 });
    expect(frame).toEqual({ x: 5, y: 6, width: 300, height: 250 });
  });

  test('derives frame from playerSize', () => {
    const frame = resolvePlayerFrame(undefined, { width: 320, height: 240 }, 1, 2);
    expect(frame).toEqual({ x: 1, y: 2, width: 320, height: 240 });
  });
});

describe('event names', () => {
  test('includes required listener events', () => {
    expect(YOUTUBE_PLAYER_EVENTS).toEqual([
      'playerReady',
      'playerStateChange',
      'playerError',
      'currentTimeChange',
      'playbackRateChange',
      'fullscreenChange',
    ]);
  });

  test('minimum dimension matches YouTube requirement', () => {
    expect(MIN_PLAYER_DIMENSION).toBe(200);
  });
});
