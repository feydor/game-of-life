/* GameState.ts - holds globals and the Game state */
import * as GOL from "../../game/gameoflife";
import { Clock, Camera } from 'three';

export const GameState = new GOL.Game(39, 39);

export enum GameSpeed {
  VerySlow = 9,
  Slow = 8,
  Medium = 6,
  Fast = 4
}

// globals
export const globals = {
  time: 0,
  deltaTime: 0,
  deltaRotation: 0.01,
  moveSpeed: 4,
  camera: Camera,
  clock: new Clock(),
  gameSpeed: GameSpeed.Medium,
};

