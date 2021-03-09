import { useEffect } from "react";
import style from "./Canvas.module.css";
import * as GOL from "../../game/gameoflife";

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils.js';

import InputManager from "../InputManager/InputManager";
import AnimationManager from "../AnimationManager/AnimationManager";
import GameObjectManager from "../GameObjectManager/GameObjectManager";
import * as Components from "../Component/Component.js";

// globals
export const globals = {
  time: 0,
  deltaTime: 0,
  deltaRotation: 0.01,
  moveSpeed: 16,
  camera: undefined,
  cameraInfo: undefined,
};
let then;
const inputManager = new InputManager();
const gAnimManager = new AnimationManager();
const gGameObjectManager = new GameObjectManager();
const gGame = new GOL.Game();

// three.js globals
let renderer;
let scene;

const materials = {
  field: undefined,
  isAlive: undefined,
  isDead: undefined,
};
const lights = {
  topLight: undefined,
  bottomLight: undefined,
  hemisphereLight: undefined,
};
const models = {
  fox: undefined,
  llama: undefined,
  sheep: undefined,
  bunny: undefined,
  cell: undefined,
}

let gSphere;
let gField;
let gCells = new Array(gGame.WIDTH * gGame.HEIGHT);
const gMixers = [];
const gMixerInfos = [];
const gClock = new THREE.Clock();

/**
 * for webgl rendering
 * @class Canvas
 */
const Canvas = (props) => {
  
  const init = async () => {
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( props.width, props.height );

    initCamera(props.width, props.height);

    // init mouse interaction
    const controls = new OrbitControls(globals.camera, renderer.domElement);
    controls.enablePan = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 10;
    controls.update();

    scene = new THREE.Scene();

    // init the skybox
    const skyboxMaterials = createMaterialArray('skybox/island.jpg', 6);
    const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000); 
    const skybox = new THREE.Mesh( skyboxGeo, skyboxMaterials );
    scene.add( skybox );

    // init the field sphere
    const radius = 1;
    const widthSegments = 24;
    const heightSegments = 10;
    const sphere = new THREE.SphereGeometry(radius, widthSegments, heightSegments);

    const loader = new THREE.TextureLoader();
    const gridMaterial = new THREE.MeshBasicMaterial({
      flatShading: true,
      map: loader.load('grid.jpg')
    });
    
    gSphere = new THREE.Mesh( sphere, gridMaterial );
    // scene.add( gSphere );

    initLights();

    initMaterials();

    await initModelsAndAnimations();

    initObjects();

    const sheepObject = gGameObjectManager.createGameObject(scene, "sheep");
    sheepObject.addComponent(Components.Animal, models.sheep);
    sheepObject.transform.position.x = 1;
    
    renderer.setAnimationLoop( render );
  };

  useEffect(() => {
    init();
    document.getElementById("canvas-container").appendChild(renderer.domElement);
  });

  return <div id="canvas-container" className={style.Canvas}></div>;
};

/**
 * a single tick of rendering
 * @param {number} now
 */
function render(now) {
  globals.time  = now * 0.001; // to seconds
  globals.deltaTime = Math.min(globals.time - then, 1 / 20); // limit deltaTime to 1/20 of a second
  then = globals.time;
  
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    globals.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    globals.camera.updateProjectionMatrix();
  }

  // update GoL state
  if (Math.trunc(now) % 6 == 0) {
      gGame.update();
      updateCells();
  }

  // update animations
  for (const {mixer} of gAnimManager.mixers()) {
    mixer.update(gClock.getDelta());
  }
  
  // update currently playing animation
  if (inputManager.justPressed("Enter")) {
    const mixerInfo = gMixerInfos[1]; // range between 0 and 7
    if (!mixerInfo) {
      return;
    }
    gAnimManager.playNextAction(mixerInfo);
  }

  // update sphere inputs
  if (inputManager.isDown("ArrowRight")) gSphere.rotation.y += globals.deltaRotation;
  if (inputManager.isDown("ArrowLeft")) gSphere.rotation.y -= globals.deltaRotation;
  if (inputManager.isDown("ArrowUp")) gSphere.rotation.x += globals.deltaRotation;
  if (inputManager.isDown("ArrowDown")) gSphere.rotation.x -= globals.deltaRotation;


  gGameObjectManager.update()

  inputManager.update();
  renderer.render(scene, globals.camera);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

/**
 * cartesian coordinates to spherical coordinates
 * @returns {THREE.Vector3}
 */
function latLongToVector3(lat, lon, radius, height) {
  let phi = (lat)*Math.PI/180;
  let theta = (lon-180)*Math.PI/180;

  var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
  var y = (radius + height) * Math.sin(phi);
  var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);
}

/**
 * generates an array of loaded materials for the skybox
 * Note: for now, n entries of the same filename
 * @return {THREE.Material[]}
 */
function createMaterialArray(filename, n) {
  let materialArr = [];
   for (let i = 0; i < n; i++) {
    let texture = new THREE.TextureLoader().load(filename);
    materialArr.push( new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }) );
   }
  return materialArr;
}

/**
 * @param {number} width, height
 */
function initCamera(width, height) {
  // define a frustum
  const fov = 65; // 70
  const aspect = width / height;
  const near = 0.1;
  const far = 30000;
  globals.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  globals.camera.position.z = 1000;
  
  const cameraObject = gGameObjectManager.createGameObject(globals.camera, 'camera');
  globals.cameraInfo = cameraObject.addComponent(Components.CameraInfo);
}

function initMaterials() {
  let textureLoader = new THREE.TextureLoader();

  // board material
  materials.field = new THREE.MeshBasicMaterial({
    map: textureLoader.load('grid.jpg')
  });

  // cell is dead material
  materials.isDead = new THREE.MeshPhongMaterial({
    map: textureLoader.load('light_square.jpg'),
    transparent: true,
    opacity: 0.0,
  });
  //
  // cell is alive material
  materials.isAlive = new THREE.MeshPhongMaterial({
    map: textureLoader.load('light_square.jpg')
  });
}

function initLights() {
  // top light
  lights.topLight = new THREE.PointLight();
  lights.topLight.position.set(0, 150, 0.1);
  lights.topLight.intensity = 1.0;
  
  // bottom light
  lights.bottomLight = new THREE.PointLight();
  lights.bottomLight.position.set(0, -15, 0.1);
  lights.bottomLight.intensity = 1.0;

  // hemisphere light
  lights.hemisphereLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 1.0);
  // add the lights in the scene
  scene.add(lights.hemisphereLight);
  // scene.add(lights.topLight);
  // scene.add(lights.bottomLight);
}

async function initModelsAndAnimations() {
  // init bunny model
  let loader = new OBJLoader();
  let bunnyObj = await loader.loadAsync('big-buck-bunny.obj');
  bunnyObj.traverse( (child) => {
    if (child instanceof THREE.Mesh) {
      models.bunny = child.geometry;
    }
  });

  // load animal models
  const fbxLoader = new FBXLoader();
  const sheepFbx = await fbxLoader.loadAsync('sheep.fbx');
  models.sheep = { fbx: sheepFbx };
  console.log(models.sheep.fbx);

  // init animations
  let animsByName = {};                                                                                                      
  models.sheep.fbx.animations.forEach(clip => { 
    animsByName[clip.name] = clip
    console.log('  ', clip.name);
  });                                                                   
  models.sheep.animations = animsByName;
  console.log(models.sheep.animations);

  const root = new THREE.Object3D();
  root.add(models.sheep.fbx);
  root.position.x = -1;
  root.position.z = 1;
  root.rotateY(90);
  root.scale.set(0.005, 0.005, 0.005);

  const mixer = new THREE.AnimationMixer(root);
  const actions = Object.values(models.sheep.animations).map((clip) => {
    return mixer.clipAction(clip);
  });
  const mixerInfo = {
    mixer,
    actions,
    index: 0
  };
  gAnimManager.push(mixerInfo);
  gAnimManager.playNextAction(mixerInfo);
}

function initObjects() {
  let fieldGeom = new THREE.PlaneGeometry( 10, 10 ); // 10x10 board
  gField = new THREE.Mesh( fieldGeom, materials.field );   
  gField.position.set(0, 0, 0); // align on (0, 0)
  scene.add( gField );

  models.cell = new THREE.PlaneGeometry( 1, 1, 1, 1 ); // 1x1 cell
  
  // init the Game of Life cells on gField
  let cellMaterial;
  for (let y = 0; y < gGame.HEIGHT; y++) {
    for (let x = 0; x < gGame.WIDTH; x++) {
      const isAlive = gGame.currCells.getCellState(x, y);
      cellMaterial = (isAlive) ? materials.isAlive : materials.IsDead;

      // load cell, init positions, and add to scene
      const cell = new THREE.Mesh( models.bunny, cellMaterial ); 
      cell.scale.set(0.9, 0.9, 0.9);
      cell.position.set(x - 4.5, y - 4.5, 0.01);

      gCells[x + y * gGame.HEIGHT] = cell;

      scene.add( cell );
    }
  }

  scene.add( new THREE.AxesHelper(200) ); // to be able to see the xyz axis
}

function updateCells() {
  for (let y = 0; y < gGame.HEIGHT; y++) {
    for (let x = 0; x < gGame.WIDTH; x++) {
      let cell = gCells[x + y * gGame.HEIGHT];
      let newState = gGame.currCells.getCellState(x, y);
      
      // if change to cell state, update material
      cell.material = (newState) ? materials.isAlive : materials.isDead;
    }
  }
}

export default Canvas;
