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

enum LoadedConfiguration {
  Random,
  Gun,
  Acorn
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
  boardSize: 40,
  trail: false, // formely alive cells leave a 'trail',
  colors: false, // random colors for alive and/or formely alive cells
  loadedConfiguration: LoadedConfiguration.Random,
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

export function handleResetEvent() {
  globals.runState.isRunning = false;
  switch (globals.loadedConfiguration) {
    case LoadedConfiguration.Random:
      GameState.setUpRandom();
      break;
    case LoadedConfiguration.Gun:
      GameState.setUpGosperGun();
      break;
    case LoadedConfiguration.Acorn:
      GameState.setUpAcorn();
      break;
  }
  document.dispatchEvent(new Event("requestGameAnimationFrame"));
  document.dispatchEvent(new Event("retestOptions"));
}

/**
 * changes the gamestate and sends out an event on Document for one animation frame
 */
export function handleLoadEvent(e: Event) {
  globals.runState.isRunning = false;
  switch (e.target.value) {
    case "random":
      globals.loadedConfiguration = LoadedConfiguration.Random;
      document.dispatchEvent(new Event("requestGameAnimationFrame"));
      break;
    case "gun":
      globals.loadedConfiguration = LoadedConfiguration.Gun;
      document.dispatchEvent(new Event("requestGameAnimationFrame"));
      break;
    case "acorn":
      globals.loadedConfiguration = LoadedConfiguration.Acorn;
      document.dispatchEvent(new Event("requestGameAnimationFrame"));
      break;
    default:
      console.error(`${e.target.value} is not an available option.`);
      break;
  }

  handleResetEvent(); // requests an animation frame
}

export function handleViewChange() {
  globals.is3D = !globals.is3D;
  handleResetEvent();
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
