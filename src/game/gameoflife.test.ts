/* gameoflife.test.ts */
import * as GOL from './gameoflife';

let cellmap: GOL.CellMap;
const WIDTH = 3;
const HEIGHT = 3;

beforeEach(() => {
  cellmap = new GOL.CellMap(HEIGHT, WIDTH);
});

test("cellmap constructor works", () => {
  expect(cellmap.width).toEqual(WIDTH);
  expect(cellmap.height).toEqual(HEIGHT);
  expect(cellmap.getCellState(0, 0)).toEqual(false);
  expect(cellmap.getCellState(WIDTH, HEIGHT)).toEqual(false); // test wrapping
});

test("setCell works", () => {
  cellmap.setCell(0, 0);
  expect(cellmap.getCellState(0, 0)).toEqual(true);
  cellmap.setCell(2, 2);
  expect(cellmap.getCellState(2, 2)).toEqual(true);
});

test("clearCell works", () => {
  cellmap.setCell(0, 0);
  expect(cellmap.getCellState(0, 0)).toEqual(true);
  cellmap.clearCell(0, 0);
  expect(cellmap.getCellState(0, 0)).toEqual(false);
});

test("getLivingNeighbors works: without wrapping", () => {
  // set cells around (1, 1)
  cellmap.setCell(1, 0);
  cellmap.setCell(2, 0);
  cellmap.setCell(2, 1);
  cellmap.setCell(2, 2);
  cellmap.setCell(1, 2);
  cellmap.setCell(0, 2);
  cellmap.setCell(0, 1);
  cellmap.setCell(0, 0);
  expect(cellmap.getLivingNeighbors(1, 1)).toEqual(8);
});

test("getLivingNeighbors works: with wrapping", () => {
  // set cells around (0, 1)
  cellmap.setCell(0, 0);
  cellmap.setCell(1, 0);
  cellmap.setCell(1, 1);
  cellmap.setCell(1, 2);
  cellmap.setCell(0, 2);
  cellmap.setCell(2, 2); // wraparound
  cellmap.setCell(2, 1); // wraparound
  cellmap.setCell(2, 0); // wraparound
  expect(cellmap.getLivingNeighbors(0, 1)).toEqual(8);
});

test("nextGeneration works: simple oscillators", () => {
  cellmap = new GOL.CellMap(5, 5); // need bigger board for oscillators
  
  // blinker with a period of 2
  cellmap.setCell(2, 2);
  cellmap.setCell(2, 3);
  cellmap.setCell(2, 4);
  expect(cellmap.getCellState(2, 3)).toEqual(true); // check center
  expect(cellmap.getLivingNeighbors(2, 3)).toEqual(2);
  expect(cellmap.getLivingNeighbors(2, 2)).toEqual(1);
  expect(cellmap.getLivingNeighbors(2, 4)).toEqual(1);

  expect(cellmap.getLivingNeighbors(1, 3)).toEqual(3); // check new cells
  
  let nextGen = cellmap.nextGeneration();
  expect(nextGen.getCellState(1, 3)).toEqual(true);
  expect(nextGen.getCellState(2, 3)).toEqual(true);
  expect(nextGen.getCellState(3, 3)).toEqual(true);
  expect(nextGen.getCellState(2, 2)).toEqual(false);
  expect(nextGen.getCellState(4, 2)).toEqual(false);
});

test("iteration works", () => {
  for (let cell of cellmap.cells) {
    expect(cell).toEqual(false);
  }
});

test("Game text interface works", () => {
  let game = new GOL.Game();
  game.run();
});
