/* components.js - components to be stored in a GameObjectManager */
import { AnimationMixer, Matrix4, Frustum, Object3D } from 'three';
import { SkeletonUtils } from'three/examples/jsm/utils/SkeletonUtils.js';

import * as Game from '../Canvas/Canvas';

// Base for all components
class Component {
  constructor(gameObject) {
    this.gameObject = gameObject;
  }

  update() { }
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

  setAnimation(animName) {
    const clip = this.model.animations[animName];

    // turn off all current actions
    for (const action of Object.values(this.actions)) {
      action.enabled = false;
    }

    // get or create existing action for clip
    const action = this.mixer.clipAction(clip);
    action.enabled = true;
    action.reset();
    action.play();
    this.actions[animName] = action;
  }

  update() {
    this.mixer.update(Game.globals.deltaTime);
  }
}

export class CameraInfo extends Component {
  constructor(gameObject) {
    super(gameObject);
    this.projScreenMatrix = new Matrix4();
    this.frustum = new Frustum();
  }

  update() {
    const {camera} = Game.globals;
    this.projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }
}

export class Animal extends Component {
  constructor(gameObject, model) {
    super(gameObject);
    const skinInstance = gameObject.addComponent(SkinInstance, model);
    skinInstance.mixer.timeScale = Game.globals.moveSpeed / 4;
    skinInstance.setAnimation('Armature|Idle');

    skinInstance.animRoot.scale.set(0.005, 0.005, 0.005); // set default size
  }
}
