/* InputManager.ts */

interface KeyState {
  justPressed: boolean;
  down: boolean;
}

/**
 * keeps the state of keys
 * @class InputManager
 * @example
 * - const inputManager = new InputManager()
 * - inputManager.isDown("ArrowLeft") = true/false
 * - inputManager.justPressed("Enter") = true/false
 * - inputManager.update(), sets all 'justPressed' states to false
 */
export default class InputManager {
  keymap: Map<string, KeyState>;

  /**
   * sets possible key values and event listeners
   */
  constructor() {
    this.keymap = new Map(); 
    this.keymap.set("ArrowLeft", { justPressed: false, down: false });
    this.keymap.set("ArrowUp", { justPressed: false, down: false });
    this.keymap.set("ArrowRight", { justPressed: false, down: false });
    this.keymap.set("ArrowDown", { justPressed: false, down: false });
    this.keymap.set("Enter", { justPressed: false, down: false });

    window.addEventListener('keydown', (e) => {
      this.setKeyFromCode(e.code, true);
    });
    window.addEventListener('keyup', (e) => {
      this.setKeyFromCode(e.code, false);
    });
  }

  /**
   * changes the state of the specified key
   * @param code - from event.code in key event listener
   * @param pressed
   * @example
   * - setKeyFromCode("ArrowLeft", true), on keydown
   */
  private setKeyFromCode = (code: string, pressed: boolean) => {
    const key = this.keymap.get(code);

    // ignore keys not in keymap
    if (!key) {
      return;
    }

    let newState = {
      justPressed: pressed && !key.down,
      down: pressed,
    };

    this.keymap.set( code, newState );
  };

  /**
   * returns 'justPressed' state for key
   * @throws error when code is not in keymap
   */
  justPressed(code: string): boolean {
    if (!this.keymap.has(code)) throw new Error(`Key ${code} is not in InputManager.`);
    return this.keymap.get(code).justPressed;
  }
  
  /**
   * returns 'down' state for key
   * @throws error when code is not in keymap
   */
  isDown(code: string): boolean {
    if (!this.keymap.has(code)) throw new Error(`Key ${code} is not in InputManager.`);
    return this.keymap.get(code).down;
  }

  /* resets justPressed states to false */
  update() {
    for (const keyState of Object.values(this.keymap)) {
      if (keyState.justPressed) {
        keyState.justPressed = false;
      }
    }
  }
}
