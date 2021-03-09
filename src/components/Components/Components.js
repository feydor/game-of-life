/* GameObject.js - game objects to be stored in a GameObjectManager */
import { AnimationMixer, Matrix4, Frustum, Object3D } from 'three';
import { GameState, globals } from '../GameState/GameState';

// Base for all game objects
export class Component {
  constructor(gameObject) {
    this.gameObject = gameObject;
  }

  update() {}
}

/**
 * @example
 * const skinInstance = new SkinInstance()
 */
export class SkinInstance extends Component {

  constructor(gameObject, model) {
    super(gameObject);
    this.model = model;
    this.animRoot = new Object3D();
    this.animRoot.add(model.fbx);
    this.mixer = new AnimationMixer(this.animRoot);
    gameObject.transform.add(this.animRoot);
    this.actions = {};
  }

  setAnimation(animationName) {
    const clip = this.model.animations[animationName];

    // turn off all current actions
    for (const action of Object.values(this.actions)) {
      action.enabled = false;
    }

    // get or create existing action for clip
    const action = this.mixer.clipAction(clip);
    action.enabled = true;
    action.reset();
    action.play();
    this.actions[animationName] = action;
  }

  update() {
    this.mixer.update(globals.clock.getDelta());
  }
}

export class Camera extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.projScreenMatrix = new Matrix4();
    this.frustum = new Frustum();
  }

  update() {
    const {camera} = globals;
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }
}

export class Animal extends Component {
  constructor(gameObject, model) {
    super(gameObject);
    const skinInstance = new SkinInstance(gameObject, model);
    gameObject.addComponent(skinInstance);
    skinInstance.mixer.timeScale = globals.moveSpeed / 4;

    skinInstance.setAnimation('Armature|Jump');
  }

  update() {
    // this.gameObject.transform.position.x++;
    /*
    for (let y = 0; y < GameState.HEIGHT; y++) {
      for (let x = 0; x < GameState.WIDTH; x++) {
        let newState = GameState.currCells.getCellState(x, y);
        
        
        // if change to cell state, update material
        cell.material = (newState) ? materials.isAlive : materials.isDead;
      }
    }
    */
  }

}
