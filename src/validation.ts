import type { IPlayerFrame } from './definitions';
import type { IPlayerSize } from './web/models/models';

/** Minimum width and height for embedded YouTube players (CSS pixels). */
export const MIN_PLAYER_DIMENSION = 200;

export const MIN_PLAYER_SIZE_ERROR = `Player dimensions must be at least ${MIN_PLAYER_DIMENSION}x${MIN_PLAYER_DIMENSION} CSS pixels`;

export function validatePlayerSize(width: number, height: number): void {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error('Player width and height must be finite numbers');
  }
  if (width < MIN_PLAYER_DIMENSION || height < MIN_PLAYER_DIMENSION) {
    throw new Error(MIN_PLAYER_SIZE_ERROR);
  }
}

export function validatePlayerFrame(frame: IPlayerFrame): void {
  if (!Number.isFinite(frame.x) || !Number.isFinite(frame.y)) {
    throw new Error('Player frame x and y must be finite numbers');
  }
  validatePlayerSize(frame.width, frame.height);
}

export function resolvePlayerFrame(
  playerFrame: IPlayerFrame | undefined,
  playerSize: IPlayerSize | undefined,
  defaultX = 0,
  defaultY = 0,
): IPlayerFrame {
  if (playerFrame) {
    validatePlayerFrame(playerFrame);
    return playerFrame;
  }

  const width = playerSize?.width ?? MIN_PLAYER_DIMENSION;
  const height = playerSize?.height ?? MIN_PLAYER_DIMENSION;
  validatePlayerSize(width, height);
  return { x: defaultX, y: defaultY, width, height };
}
