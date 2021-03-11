/* GameState.ts - holds globals and the Game state */
import * as GOL from "../../game/gameoflife";
import { Clock, Camera } from 'three';

export const GameState = new GOL.Game(40, 40);
GameState.setUpRandom(); // TODO: User input

export function handlePlayEvent() {
  console.log("clicked play button.");
  globals.runState.isRunning = true; 
}

export function handlePauseEvent() {
  console.log("clicked pause button.");
  globals.runState.isRunning = false; 
}

export enum GameSpeed {
  VerySlow = 6,
  Slow = 5,
  Medium = 4,
  Fast = 3,
  VeryFast = 2
}

// globals
export const globals = {
  moveSpeed: 4,
  camera: Camera,
  clock: new Clock(),
  gameSpeed: GameSpeed.VerySlow,
  aspect: 1.5, // set in Canvas along with width and height
  width: 720,
  height: 720,
  boardSize: 40,
  runState: {
    m_isRunning: false,
    listener: function (val: any) {},
    set isRunning(b: boolean) {
      this.m_isRunning = b;
      this.listener(b);
    },
    get isRunning() {
      return this.m_isRunning;
    },
    registerListener: function (listener: (val: any) => void) {
      this.listener = listener;
    }
  }
};

