/* SafeArray.js - an array with queues to add or delete elements */

/**
 * @example:
 * - const arr = new SafeArray();
 * - arr.forEach(... really long callback ...)
 *   - arr.add(elem) does not alter forEach until completion
 */
export class SafeArray {
  constructor() {
    this.array = [];
    this.addQueue = [];
    this.removeQueue = new Set();
  }

  get isEmpty() {
    return this.addQueue.length + this.array.length > 0;
  }

  add(element) {
    this.addQueue.push(element);
  }

  remove(element) {
    this.removeQueue.add(element);
  }

  /* safe array traversal with callback */
  forEach(fn) {
    this._addQueued();
    this._removeQueued();
    for (const element of this.array) {
      if (this.removeQueue.has(element)) {
        continue;
      }
      fn(element);
    }
    this._removeQueued();
  }

  /* adds queued items into array */
  _addQueued() {
    if (this.addQueue.length) {
      this.array.splice(this.array.length, 0, ...this.addQueue);
      this.addQueue = [];
    }
  }

  /* removes queued items from array */
  _removeQueued() {
    if (this.removeQueue.size) {
      this.array = this.array.filter(element => !this.removeQueue.has(element));
      this.removeQueue.clear();
    }
  }
}

export function removeArrayElement(array, element) {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}
