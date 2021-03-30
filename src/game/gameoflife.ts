/* gameoflife.ts - conway's game of life */

// constants
const WRAPEDGES = true;

interface CellMapInterface {
  width: number;
  height: number;
  cells: Array<boolean>;
}

/**
 * Conway's Game of Life
 * @class CellMap
 * @implements CellMapInterface
 */
export class CellMap implements CellMapInterface {
  width: number;
  widthPlusPadding: number;
  height: number;
  heightPlusPadding: number;
  cells: Array<boolean>; /* 0 indexed */

  constructor(h: number, w: number) {
    this.width = w;
    this.widthPlusPadding = w + 2; // cell padding on each side
    this.height = h;
    this.heightPlusPadding = h + 2;
    this.cells = new Array(w * h).fill(false);
  }

  /* turns a cell on */
  setCell(x: number, y: number): void {
    if (x >= this.width || x < 0 || y >= this.height || y < 0)
      throw new RangeError("Arguments are out of range.");
    this.cells[x + y * this.height] = true;
  }

  /* turns a cell off */
  clearCell(x: number, y: number): void {
    if (x >= this.width || x < 0 || y >= this.height || y < 0)
      throw new RangeError("Arguments are out of range.");
    this.cells[x + y * this.height] = false;
  }

  /* returns the cell's current state
   * @example:
   * - WRAPEDGE = true, width = 3, height = 3
   *   - getCellState(0, 0) = true
   *   - getCellState(3, 3) = true, wraps around to (0, 0)
   */
  getCellState(x: number, y: number): boolean {
    if (WRAPEDGES) {
      while (x < 0) x += this.width;
      while (x >= this.width) x -= this.width;
      while (y < 0) y += this.height;
      while (y >= this.height) y -= this.height;
    } else {
      if (x >= this.width || x < 0 || y >= this.height || y < 0)
        throw new RangeError("Arguments are out of range.");
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
    if (this.getCellState(x, y - 1)) count++; // N
    if (this.getCellState(x + 1, y - 1)) count++; // NE
    if (this.getCellState(x + 1, y)) count++; // E
    if (this.getCellState(x + 1, y + 1)) count++; // SE
    if (this.getCellState(x, y + 1)) count++; // S
    if (this.getCellState(x - 1, y + 1)) count++; // SW
    if (this.getCellState(x - 1, y)) count++; // W
    if (this.getCellState(x - 1, y - 1)) count++; // NW

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
          if (neighborCount < 2 || neighborCount > 3) {
            // cell dies when neighbors < 2 and neighbors > 3
            nextMap.clearCell(x, y);
          }
        } else {
          // cell is currently dead
          if (neighborCount === 3) {
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
  HEIGHT = 17;
  WIDTH = 17;

  /* variable size constructor */
  constructor(height: number = 17, width: number = 17) {
    this.HEIGHT = height;
    this.WIDTH = width;
    this.currCells = new CellMap(this.HEIGHT, this.WIDTH);
  }

  update() {
    this.currCells = this.currCells.nextGeneration();
  }

  setUpGosperGun() {
    this.clearField();
    let x = 1;
    let y = this.WIDTH / 2;

    // left square
    this.currCells.setCell(x, y);
    this.currCells.setCell(x + 1, y);
    this.currCells.setCell(x, y - 1);
    this.currCells.setCell(x + 1, y - 1);

    x += 10;

    // queen bee
    this.currCells.setCell(x, y);
    this.currCells.setCell(x + 1, y + 1);
    this.currCells.setCell(x + 2, y + 2);
    this.currCells.setCell(x + 3, y + 2);

    this.currCells.setCell(x + 5, y + 1);
    this.currCells.setCell(x + 6, y);
    this.currCells.setCell(x + 6, y - 1);
    this.currCells.setCell(x + 7, y - 1); // tip
    this.currCells.setCell(x + 6, y - 2);
    this.currCells.setCell(x + 5, y - 3);

    this.currCells.setCell(x + 4, y - 1);

    this.currCells.setCell(x + 3, y - 4);
    this.currCells.setCell(x + 2, y - 4);
    this.currCells.setCell(x + 1, y - 3);
    this.currCells.setCell(x, y - 2);
    this.currCells.setCell(x, y - 1);

    x += 10;

    // 2nd bee
    this.currCells.setCell(x, y);
    this.currCells.setCell(x, y + 1);
    this.currCells.setCell(x, y + 2);
    this.currCells.setCell(x + 1, y + 2);
    this.currCells.setCell(x + 1, y + 1);
    this.currCells.setCell(x + 1, y);

    // bottom wing
    this.currCells.setCell(x + 2, y - 1);
    this.currCells.setCell(x + 4, y - 1);
    this.currCells.setCell(x + 4, y - 2);
    // topwing
    this.currCells.setCell(x + 2, y + 3);
    this.currCells.setCell(x + 4, y + 3);
    this.currCells.setCell(x + 4, y + 4);

    x += 14;

    // last block
    this.currCells.setCell(x, y + 1);
    this.currCells.setCell(x, y + 2);
    this.currCells.setCell(x + 1, y + 2);
    this.currCells.setCell(x + 1, y + 1);
  }

  setUpRandom() {
    this.clearField();
    for (let y = 0; y < this.currCells.height; y++) {
      for (let x = 0; x < this.currCells.width; x++) {
        let rand = Math.floor(Math.random() * this.HEIGHT) + 1; // rand(1, this.Height)
        if (rand % 2 === 0) this.currCells.setCell(x, y);
      }
    }
  }

  setUpAcorn() {
    this.clearField();
    let x = this.WIDTH / 2;
    let y = this.HEIGHT / 2;

    this.currCells.setCell(x, y);
    this.currCells.setCell(x + 1, y);
    this.currCells.setCell(x + 1, y + 2);
    this.currCells.setCell(x + 3, y + 1);
    this.currCells.setCell(x + 4, y);
    this.currCells.setCell(x + 5, y);
    this.currCells.setCell(x + 6, y);
  }

  clearField() {
    this.currCells = new CellMap(this.HEIGHT, this.WIDTH);
  }
}
