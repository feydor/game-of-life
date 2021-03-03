/* gameoflife.ts - conway's game of life */

// constants
const WRAPEDGES = true;

interface CellMapInterface {
  width: number,
  height: number,
  cells: Array<boolean>
}

/**
 * Conway's Game of Life
 * @class CellMap
 * @implements CellMapInterface
 */
export class CellMap implements CellMapInterface {
  width: number;
  height: number;
  cells: Array<boolean>; /* 0 indexed */
  
  constructor(h: number, w: number) {
    this.width = w;
    this.height = h;
    this.cells = new Array(w * h).fill(false);
  }

  /* turns a cell on */
  setCell(x: number, y: number): void {
    if (x >= this.width || x < 0 || y >= this.height || y < 0) throw new RangeError('Arguments are out of range.');
    this.cells[x + y * this.height] = true; 
  }
  
  /* turns a cell off */
  clearCell(x: number, y: number): void {
    if (x >= this.width || x < 0 || y >= this.height || y < 0) throw new RangeError('Arguments are out of range.');
    this.cells[x + y * this.height] = false; 
  }

  /* returns the cell's current state 
   * @example:
   * - WRAPEDGE = true, width = 3, height = 3
   *   - getCellState(0, 0) = true
   *   - getCellState(3, 3) = true, wraps around to (0, 0)
   */ 
  getCellState(x: number, y:number): boolean {
    if (WRAPEDGES) {
      while (x < 0) x += this.width;
      while (x >= this.width) x -= this.width;
      while (y < 0) y += this.height;
      while (y >= this.height) y -= this.height;
    } else {
      if (x >= this.width || x < 0 || y >= this.height || y < 0) throw new RangeError('Arguments are out of range.');
    }
     
    return this.cells[x + y * this.height];
  }

  /**
   * gets the number of living neighbors, each cell always has 8 neighbors
   * @param {number} x, y
   * @return {number} count
   */
  getLivingNeighbors(x: number, y: number): number {
    let count = 0;

    // going clockwise, starting from the topmost neighbor
    if (this.getCellState(x, y-1)) count++;   // N
    if (this.getCellState(x+1, y-1)) count++; // NE
    if (this.getCellState(x+1, y)) count++;   // E
    if (this.getCellState(x+1, y+1)) count++; // SE
    if (this.getCellState(x, y+1)) count++;   // S
    if (this.getCellState(x-1, y+1)) count++; // SW
    if (this.getCellState(x-1, y)) count++;   // W
    if (this.getCellState(x-1, y-1)) count++; // NW
    
    return count;
  }
  
  /**
   * generates the next generation of cells from the current one
   * @returns {CellMap}
   * rules: 1. Any live cell with two or three live neighbours survives.
   *        2. Any dead cell with three live neighbours becomes a live cell. 
   *        3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
   */
  nextGeneration(): CellMap {
    let nextMap = new CellMap(this.height, this.width);
    nextMap.cells = [...this.cells];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let neighborCount = this.getLivingNeighbors(x, y);
        
        if (this.getCellState(x, y)) {
          // cell is currently alive
          if ((neighborCount < 2) || (neighborCount > 3)) {
            // cell dies when neighbors < 2 and neighbors > 3
            nextMap.clearCell(x, y);
          } 
        } else {
          // cell is currently dead
          if (neighborCount == 3) {
            nextMap.setCell(x, y);
          }
        }
      }
    }

    return nextMap;
  }
}

export class Game {
  currCells: CellMap;
  nextCells: CellMap;
  readonly HEIGHT = 25;
  readonly WIDTH = 25;
  isRunning: boolean;

  constructor() {
    this.currCells = new CellMap(this.HEIGHT, this.WIDTH);
    this.nextCells = new CellMap(this.HEIGHT, this.WIDTH);
    this.isRunning = false;

    // TODO: Have difficulty modes/ random starting seeds;
    // set up a glider, from top to bottom
    this.currCells.setCell(10, 10);
    this.currCells.setCell(11, 11);
    this.currCells.setCell(9, 12);
    this.currCells.setCell(10, 12);
    this.currCells.setCell(11, 12);
  }

  update() {
    this.nextCells = this.currCells.nextGeneration();
    console.log(this.currCells.cells);
    console.log("Running next generation.");
    console.log(this.nextCells.cells);
  }

  run() {
    this.setupInputListener();
    this.isRunning = true;

    let title = "CONWAY'S GAME OF LIFE:";
    console.log(title);
    let instructions = "Press ENTER to iterate and q to exit.";
    console.log(instructions);
  }

  /**
   * returns a string containing an ascii-representation of the current cells
   */
  draw(): string {
    let out = "";
    for (let y = 0; y < this.currCells.height; y++) {
      for (let x = 0; x < this.currCells.width; x++) {
        if (x == 0 || x == this.currCells.width - 1) out += "|";
        if (y == 0 || y == this.currCells.height - 1) out += "_";
        out += this.currCells.getCellState(x, y) ? "1" : "0";
      }
    }
    return out;
  }

  handleInput(e: KeyboardEvent): string {
     switch (e.code) {
       case "Enter":
         this.currCells = this.currCells.nextGeneration();
         let out = this.draw();
         return out;
      case "Backspace":
      case "KeyQ":
      case "KeyE":
        this.isRunning = false;
        return "Exiting";
     
      default:
        return "Controls: 'Enter' for next iteration, 'Backspace/q/e' to quit"
     }
  }

  setupInputListener(): void {
    document.addEventListener('keydown', (e) => {
     let status = this.handleInput(e);
     console.log(status);
    });  
  }
}
