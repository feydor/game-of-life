import { Object3D } from 'three';

/**
 * GameObjectManager.js - modified from the followiung examples:
 * https://threejsfundamentals.org/threejs/lessons/threejs-game.html
 */

/**
 * contains the game's GameObjects
 * @example
 * - const gameManager = new GameObjectManager();
 * - gameManager.update() calls update() on every GameObject
 */
export default class GameObjectManager {
  constructor() {
    this.gameObjects = new SafeArray();
  }

  /**
   * @param {THREE component} parent
   * @param {string} name
   * @return {GameObject}
   */
  createGameObject(parent, name) {
    const gameObject = new GameObject(parent, name);
    this.gameObjects.add(gameObject);
    return gameObject;
  }

  removeGameObject(gameObject) {
    this.gameObjects.remove(gameObject);
  }

  update() {
    this.gameObjects.forEach(gameObject => gameObject.update());
  }
}

/**
 * @example
 * - const obj = new GameObject();
 * - obj.update() - will call update() on each of its components
 */
class GameObject {
  constructor(parent, name) {
    this.name = name;
    this.components = [];
    this.transform = new Object3D();
    parent.add(this.transform);
  }

  /**
   * @param {THREE Component Type} ComponentType
   * @param {THREE Component arguments} ...args
   * @example 
   * - addComponent(THREE.CameraInfo)
   */
  addComponent(ComponentType, ...args) {
    const component = new ComponentType(this, ...args);
    this.components.push(component);
    return component;
  }

  removeComponent(component) {
    removeArrayElement(this.components, component);
  }

  getComponent(ComponentType) {
    return this.components.find(c => c instanceof ComponentType);
  }

  update() {
    for (const component of this.components) {
      component.update();
    }
  }
}

function removeArrayElement(array, element) {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
  }
}

/**
 * @example:
 * - const arr = new SafeArray();
 * - arr.forEach(... really long callback ...)
 *   - arr.add(elem) does not alter forEach until completion
 */
class SafeArray {
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
