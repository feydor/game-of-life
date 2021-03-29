import { useEffect } from "react";
import style from "./Canvas.module.css";

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

import InputManager from "../InputManager/InputManager";
import { GameState, globals } from "../GameState/GameState.ts"; 

const inputManager = new InputManager();

// three.js globals
let renderer;
let scene = new THREE.Scene();

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

/**
 * @example:
 * - models.fox.animations - array of AnimationClips
 * - models.fox.fbx - model returned by FBXLoader
 */
const models = {
  fox: undefined,
  llama: undefined,
  sheep: undefined,
  bunny: undefined,
  cell: undefined,
}

let gField;
let gCells = new Array(GameState.WIDTH * GameState.HEIGHT);
let gColor = new THREE.Color();
let gMergedGeometry;
let gMergedMesh;

/**
 * for webgl rendering
 * @class Canvas
 */
const Canvas = (props) => {
  
  const init = async () => {
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( props.width, props.height );
    
    // save props.height and props.width in globals
    globals.width = props.width;
    globals.height = props.height;
    globals.aspect = props.width / props.height;
    console.log(props.width + ' ' + props.height);

    initCameras();

    // init the skybox
    const skyboxMaterials = createMaterialArray('skybox/island.jpg', 6);
    const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000); 
    const skybox = new THREE.Mesh( skyboxGeo, skyboxMaterials );
    scene.add( skybox );

    initLights();

    initMaterials();

    // await initModelsAndAnimations();

    initObjects();

    // change position of ui buttons on render
    let x = props.width / 20; // 10vw in UI.module.css
    let y = props.height - (props.height / 15);
    document.getElementById("play").style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    document.getElementById("pause").style.transform = `translate(-50%, -50%) translate(${3 * x}px,${y}px)`;

    initEventListeners();

    // run render() at 60fps
    setInterval( function () {
      requestAnimationFrame( render );
    }, 1000 / 60 );
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
function render() {
  
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    if (!globals.is3D) {
      globals.orthographicCamera.aspect = canvas.clientWidth / canvas.clientHeight;
      globals.orthographicCamera.updateProjectionMatrix();
    } else {
      globals.perspectiveCamera.aspect = canvas.clientWidth / canvas.clientHeight;
      globals.perspectiveCamera.updateProjectionMatrix();
    }
  }

  // update GoL state if globals.isRunning
  if (globals.runState.isRunning && Math.trunc(globals.clock.getDelta()) % globals.gameSpeed === 0) {
      GameState.update();
      updateCells(false);
  }

  if (!globals.is3D) {
    renderer.render(scene, globals.orthographicCamera);
  } else {
    renderer.render(scene, globals.perspectiveCamera);
  }
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

function initCameras() {
  // init the cameras
  // save perspectiveCam to globals
  const fov = 85;
  let aspect = globals.aspect; // TODO: Change based on screen size
  const near = 0.1;
  const far = 10000;
  globals.perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  globals.perspectiveCamera.position.set(0, 0, 41);
  scene.add(globals.perspectiveCamera);

  aspect = globals.boardSize * globals.aspect;
  globals.orthographicCamera = new THREE.OrthographicCamera( aspect / - 2, aspect / 2, aspect / 2, aspect / - 2, 0.1, 30000 );
  globals.orthographicCamera.position.set(0, 0, 2);

  scene.add( globals.orthographicCamera );

  // init mouse interaction
  const orthoControls = new OrbitControls(globals.orthographicCamera, renderer.domElement);
  orthoControls.enablePan = false;
  orthoControls.minDistance = 1.0;
  orthoControls.maxDistance = 45;
  orthoControls.update();
  
  const perspControls = new OrbitControls(globals.perspectiveCamera, renderer.domElement);
  perspControls.enablePan = false;
  perspControls.minDistance = 1.0;
  perspControls.maxDistance = 45;
  perspControls.update();
}

function initMaterials() {
  // board material
  materials.field = new THREE.MeshBasicMaterial({
    color: 'white',
    side: THREE.DoubleSide
  });

  // cell is dead material
  materials.isDead = new THREE.MeshPhongMaterial({
    name: 'isdead',
    color: 'white',
    transparent: true,
    opacity: 0.0,
    flatShading: true,
  });

  // cell has died material
  materials.hasDied = new THREE.MeshPhongMaterial({
    name: 'hasdied',
    color: '#90EE90',
    flatShading: true,
  });

  // cell is alive material
  materials.isAlive = new THREE.MeshPhongMaterial({
    name: 'isalive',
    color: 'red',
    flatShading: true,
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
  // load animal models
  const fbxLoader = new FBXLoader();
  const sheepFbx = await fbxLoader.loadAsync('sheep.fbx');
  models.sheep = { fbx: sheepFbx, mesh: sheepFbx.children[0] };
  console.log(models.sheep.mesh);

  // init animations
  let animsByName = {};                                                                                                      
  models.sheep.fbx.animations.forEach(clip => { 
    animsByName[clip.name] = clip
    console.log('  ', clip.name);
  });                                                                   
  models.sheep.animations = animsByName;
  console.log(models.sheep.animations);
}

function initObjects() {
  let fieldGeom = new THREE.PlaneGeometry( globals.boardSize, globals.boardSize ); // 10x10 board
  gField = new THREE.Mesh( fieldGeom, materials.field );   
  gField.position.set(0, 0, -0.05); // align on (0, 0)
  gField.scale.set(1, 1, 1);
  // gField.rotateX(Math.PI / 2); // NOTE: Comment out when using PerspectiveCamera
  scene.add( gField );

  models.cell = new THREE.BoxGeometry(1, 1, 1); // 1x1 cell

  // init the Game of Life cells on gField
  for (let y = 0; y < GameState.HEIGHT; y++) {
    for (let x = 0; x < GameState.WIDTH; x++) {
      const isAlive = GameState.currCells.getCellState(x, y);
      const cellMaterial = (isAlive) ? materials.isAlive : materials.isDead;
      
      const cell = new THREE.Mesh( models.cell, cellMaterial ); 
      cell.scale.set(0.98, 0.98, 0.98);

      let overflow = 0.5; // cell size / 2
      cell.translateX((x - globals.boardSize / 2) + overflow);
      cell.translateY((y - globals.boardSize / 2) + overflow);
      cell.translateZ(-0.01);

      // OLD
      // cell.position.set((x - 19.50) * 0.25, (y - 19.50) * 0.25, - 0.01);

      gCells[x + y * GameState.HEIGHT] = { geom: cell, material: cellMaterial, state: isAlive };

      scene.add( cell );
    }
  }

  // add grid
  const size = globals.boardSize;
  const divisions = globals.boardSize;
  const colorCenterLine = 'black';
  const colorGrid = 'black';

  const gGrid = new THREE.GridHelper( size, divisions, colorCenterLine, colorGrid );
  gGrid.rotateX(Math.PI / 2); // NOTE: Uncomment when using PerspectiveCamera
  scene.add( gGrid );

  scene.add( new THREE.AxesHelper()); // to be able to see the xyz axis
}

function initEventListeners() {
  // animation frame requests
  document.addEventListener("requestGameAnimationFrame", () => {
    updateCells(true);
  });
}

/**
 * draws the cells
 * @param {boolean} reset, ignore previous state
 */
function updateCells(reset) {
  for (let y = 0; y < GameState.HEIGHT; y++) {
    for (let x = 0; x < GameState.WIDTH; x++) {
      let cell = gCells[x + y * GameState.HEIGHT].geom;

      let newState = GameState.currCells.getCellState(x, y);
      let prevState = cell.state;

      if (reset) {
        if (newState && prevState) {
          // do nothing, already alive
        } else if (newState && !prevState) {
          cell.material = materials.isAlive;
        } else if (!newState && prevState) {
          cell.material = materials.isDead;
        } else if (!newState && !prevState) {
          cell.material = materials.isDead;
        }
        cell.state = newState;
        continue;
      }

      if (globals.trail) {
        if (newState && prevState) {
          // do nothing, already alive
          // cell.material = materials.isAlive;
        } else if (newState && !prevState) {
          cell.material = materials.isAlive;
        } else if (!newState && prevState) {
          cell.material = materials.hasDied;
        } else if (!newState && !prevState) {
          // do nothing, already dead
        }
      } else {
        if (newState && prevState) {
          // do nothing, already alive
        } else if (newState && !prevState) {
          cell.material = materials.isAlive;
        } else if (!newState && prevState) {
          cell.material = materials.isDead;
        } else if (!newState && !prevState) {
          cell.material = materials.isDead;
        }
      }

      cell.state = newState;

    }
  }
}

/* a switch statement on cell material, called before a material update 
  * (this is what makes it an indicator of the previous cell state)
  * */
function getPrevState(materialName) {
  switch (materialName) {
    case "isalive":
      return true;
    case "isdead":
      return false;
    case "hasdied":
      return false;
  }
}

/**
 * returns a buffer attribute for the color attribute
 * @return {THREE.BufferAttribute}
 * @example
 * - bufferGeom.setAttribute('color', getCellColor(isAlive));
 */
function setCellColor(cell, cellState) {
  const cellStateNormalized = (cellState) ? 1 : 0;

  const hue = THREE.MathUtils.lerp(0.01, 0.5, cellStateNormalized);
  const saturation = 1;
  const lightness = 0.5;
  gColor.setHSL(hue, saturation, lightness);
  const rgb = gColor.toArray().map(v => v * 255); // convert to rgb

  // make an array to store colors for each vertex
  const numVerts = cell.getAttribute('position').count;
  const itemSize = 3;  // r, g, b
  const colors = new Uint8Array(itemSize * numVerts);
  // copy the color into the colors array for each vertex
  colors.forEach((v, idx) => {
    colors[idx] = rgb[idx % 3];
  });

  const normalized = true;
  const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized);
  cell.setAttribute('color', colorAttrib);
}

export default Canvas;
