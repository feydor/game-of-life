/* GameState.ts - holds globals and the Game state */
import * as GOL from "../../game/gameoflife";
import { Clock, Camera } from 'three';

export enum GameSpeed {
  VerySlow = 6,
  Slow = 5,
  Medium = 4,
  Fast = 3,
  VeryFast = 2
}

// globals
export const globals = {
  is3D: false,
  moveSpeed: 4,
  camera: Camera,
  perspectiveCamera: Camera,
  orthographicCamera: Camera,
  clock: new Clock(),
  gameSpeed: GameSpeed.VerySlow,
  aspect: 1.5, // set in Canvas along with width and height
  width: 720,
  height: 720,
  boardSize: 80,
  trail: false, // formely alive cells leave a 'trail'
  colors: false, // random colors for alive and/or formely alive cells
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

export const GameState = new GOL.Game(globals.boardSize, globals.boardSize);
GameState.setUpRandom(); // default

////////////////////////////////////////////////////////////////////////////
// UI / Event handlers
//////////////////////////////////////
export function handlePlayEvent() {
  globals.runState.isRunning = true; 
}

export function handlePauseEvent() {
  globals.runState.isRunning = false; 
}

/**
 * changes the gamestate and sends out an event on Document for one animation frame
 */
export function handleLoadEvent(e: Event) {
  globals.runState.isRunning = false;
  switch (e.target.value) {
    case "random":
      GameState.setUpRandom();
      document.dispatchEvent(new Event("requestGameAnimationFrame"));
      break;
    case "gun":
      GameState.setUpGosperGun();
      document.dispatchEvent(new Event("requestGameAnimationFrame"));
      break;
    case "acorn":
      GameState.setUpAcorn();
      document.dispatchEvent(new Event("requestGameAnimationFrame"));
      break;
    default:
      console.error(`${e.target.value} is not an available option.`);
      break;
  }
}

export function handleViewChange() {
  globals.is3D = !globals.is3D;
}

/**
 * layout options are inclusive
 */
export function handleLayoutChange(e: Event) {
  let isChecked = document.getElementById(e.target.id).checked;
  let id = e.target.id;
  switch (id) {
    case "trail":
      globals.trail = (isChecked) ? true : false;
      break;
    case "colors":
      globals.colors = (isChecked) ? true : false;
    break;
    default:
      console.error(`${id} is not an option in layout.`);
      break;
  }
}
