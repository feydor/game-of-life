import { useEffect } from "react";
import * as THREE from 'three';
import style from "./Canvas.module.css";
import * as GOL from "../../game/gameoflife";

import InputManager from "../InputManager/InputManager";
import {WebGLRenderTarget} from "three";
const OrbitControls = require('three-orbit-controls')(THREE);

// globals
const globals = {
  time: 0,
  deltaTime: 0,
  deltaRotation: 0.01
};
let then;
const inputManager = new InputManager();
const game = new GOL.Game();

let camera;
let renderer;
let scene;
let materials = {};
let lights = {};
let gSphere;

/**
 * for webgl rendering
 * @class Canvas
 */
const Canvas = (props) => {
  
  const init = () => {
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( props.width, props.height );

    // define a frustum
    const fov = 75;
    const aspect = props.width / props.height;
    const near = 0.1;
    const far = 30000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(1200, -250, 20000);
    // camera.position.z = 2;

    // init mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 5;
    controls.update();

    scene = new THREE.Scene();

    // init the skybox
    const skyboxMaterials = createMaterialArray('https://i.ibb.co/TL4h789/darkworld.jpg', 6);
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
    scene.add( gSphere );

    initLights();
    
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
  globals.deltaTime = Math.min(globals.time - then, 1 / 20); // limit deltaTime
  then = globals.time;
  
  // mesh.rotation.x = globals.time;
  // mesh.rotation.y = globals.time / 2000;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // update GoL state
  {
    if (inputManager.justPressed("Enter")) game.update(); 
  }

  // update sphere inputs
  {
    if (inputManager.isDown("ArrowRight")) gSphere.rotation.y += globals.deltaRotation;
    if (inputManager.isDown("ArrowLeft")) gSphere.rotation.y -= globals.deltaRotation;
    if (inputManager.isDown("ArrowUp")) gSphere.rotation.x += globals.deltaRotation;
    if (inputManager.isDown("ArrowDown")) gSphere.rotation.x -= globals.deltaRotation;
  }

  // gameObjectManager.update()
  inputManager.update();
  renderer.render(scene, camera);
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

function gameToField(game) {
  const geometry = new THREE.SphereGeometry();
  const isAliveMaterial = new THREE.MeshBasicMaterial({color: 'black'});
  const isDeadMaterial = new THREE.MeshBasicMaterial({color: 'white'});

  for (let y = 0; y < game.HEIGHT; y++) {
    for (let x = 0; x < game.WIDTH; x++) {
      let isAlive = game.currCells.getCellState(x, y);
      const cellMaterial = (isAlive) ? isAliveMaterial : isDeadMaterial;

      let position = latLongToVector3(y, x, 600, 2);

      let cellGeom = new THREE.BoxGeometry(1, 1, 1);
      let cellMesh = new THREE.Mesh(cellGeom, cellMaterial);

      // cellMesh.position = position;

      // sphere.merge(cellMesh);
    }
  }
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

function initMaterials() {
  // board material
  materials.fieldMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('grid.jpg')
  });

  // dark square material
  materials.darkSquareMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('dark_square.jpg')
  });
  //
  // light square material
  materials.lightSquareMaterial = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('light_square.jpg')
  });
}

function initLights() {
  // top light
  lights.topLight = new THREE.PointLight();
  lights.topLight.position.set(0, 150, 0);
  lights.topLight.intensity = 1.0;

  // add the lights in the scene
  scene.add(lights.topLight);
}

export default Canvas;
