/**
 * GameObjectManager.js - modified from the following examples:
 * https://threejsfundamentals.org/threejs/lessons/threejs-game.html
 */
import { Object3D, Scene } from 'three';
import * as SA from './SafeArray';
import { Component } from '../Components/Components';

/**
 * contains the game's GameObjects
 * @class GameObjectManager
 * @example
 * - const gameManager = new GameObjectManager();
 * - gameManager.update() calls update() on every GameObject
 */
export default class GameObjectManager {
  gameObjects: SA.SafeArray;

  constructor() {
    this.gameObjects = new SA.SafeArray();
  }

  /**
   * @param {THREE.Scene} parent
   * @param {string} name
   * @return {GameObject}
   * @example
   * - const playerObject = gGameObjectManager.createGameObject(THREE.Scene, "player_name");
   *   - playerObject is a GameObject
   */
  createGameObject(parent: Scene, name: string): GameObject {
    const gameObject = new GameObject(parent, name);
    this.gameObjects.add(gameObject);
    return gameObject;
  }

  removeGameObject(gameObject: GameObject) {
    this.gameObjects.remove(gameObject);
  }

  update() {
    this.gameObjects.forEach(gameObject => { 
      gameObject.update()
    });
  }
}

/**
 * a GameObject whose parent is a THREE.Object3D()
 * @class GameObject
 * @member {Array<Component>} components
 * @member {THREE.Object3D} transform
 * @example
 * - To create a 3d GameObject and add its model:
 * - const animalObj = gGameObjectManager.createGameObject(scene, "animal_name");
 *   - animalObj.addComponent(models.animal);
 *   - animalObj.transform.position.x = 1;
 */
export class GameObject {
  name: string;
  components: Array<Component>;
  transform: Object3D;

  constructor(parent: Object3D, name: string) {
    this.name = name;
    this.components = [];
    this.transform = new Object3D();
    parent.add(this.transform);
  }

  /**
   * @param {THREE Component} component
   * @example 
   * - addComponent(new THREE.Mesh( THREE.Geometry, THREE.Material ));
   */
  addComponent(component: Component) {
    this.components.push(component);
  }

  removeComponent(component: Component) {
    SA.removeArrayElement(this.components, component);
  }

  /**
   * looks up component by ComponentType
   */
  getComponent(ComponentType: any) {
    return this.components.find(c => c instanceof ComponentType);
  }

  update() {
    for (const component of this.components) {
      component.update();
    }
  }
}
