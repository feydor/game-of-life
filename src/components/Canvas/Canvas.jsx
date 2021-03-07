import { useEffect } from "react";
import * as THREE from 'three';
import style from "./Canvas.module.css";
import * as GOL from "../../game/gameoflife";

import InputManager from "../InputManager/InputManager";
import {OBJLoader} from 'three-obj-mtl-loader';
// import {WebGLRenderTarget} from "three";
const OrbitControls = require('three-orbit-controls')(THREE);

// globals
const globals = {
  time: 0,
  deltaTime: 0,
  deltaRotation: 0.01
};
let then;
const inputManager = new InputManager();
const gGame = new GOL.Game();

let camera;
let renderer;
let scene;

let materials = {
  field: undefined,
  isAlive: undefined,
  isDead: undefined,
};
let lights = {};
let gSphere;
let gField;
let gCells = new Array(gGame.WIDTH * gGame.HEIGHT);
let cellGeom;
let bunnyGeom;
let gBunny;

/**
 * for webgl rendering
 * @class Canvas
 */
const Canvas = (props) => {
  
  const init = () => {
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( props.width, props.height );

    // define a frustum
    const fov = 95; // 70
    const aspect = props.width / props.height;
    const near = 0.1;
    const far = 30000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.set(1200, -250, 20000);
    camera.position.z = 1000;

    // init mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.minDistance = 1.0;
    controls.maxDistance = 10;
    controls.update();

    scene = new THREE.Scene();

    // init the skybox
    const skyboxMaterials = createMaterialArray('skybox/darkworld.jpg', 6);
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

    initObjects();
    
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
  if (now % 60) {
      gGame.update();
      // updateCells();
  }

  // update sphere inputs
  if (inputManager.isDown("ArrowRight")) gSphere.rotation.y += globals.deltaRotation;
  if (inputManager.isDown("ArrowLeft")) gSphere.rotation.y -= globals.deltaRotation;
  if (inputManager.isDown("ArrowUp")) gSphere.rotation.x += globals.deltaRotation;
  if (inputManager.isDown("ArrowDown")) gSphere.rotation.x -= globals.deltaRotation;

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
  let textureLoader = new THREE.TextureLoader();

  // board material
  materials.field = new THREE.MeshBasicMaterial({
    map: textureLoader.load('grid.jpg')
  });

  // cell is dead material
  materials.isDead = new THREE.MeshPhongMaterial({
    map: textureLoader.load('light_square.jpg')
  });
  //
  // cell is alive material
  materials.isAlive = new THREE.MeshPhongMaterial({
    map: textureLoader.load('dark_square.jpg')
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

function initObjects() {
  let fieldGeom = new THREE.PlaneGeometry( 10, 10 ); // 10x10 board
  gField = new THREE.Mesh( fieldGeom, materials.field );   
  gField.position.set(5, 5, 0); // align on (0, 0)
  scene.add( gField );

  cellGeom = new THREE.PlaneGeometry( 1, 1, 1, 1 ); // 1x1 cell


  // init bunny model
  var bunnyMaterial = new THREE.MeshPhongMaterial( { color: 'white' } );
  var loader = new OBJLoader();
  loader.load( 'big-buck-bunny.obj',
    function( obj ){
      obj.traverse( function( child ) {
        if ( child instanceof THREE.Mesh ) {
          // console.log(child.geometry);
          bunnyGeom = child.geometry; // TODO: Convert from BufferGeometry to Geometry???
          console.log(bunnyGeom)
          child.material = bunnyMaterial;
        }
      } );
      // scene.add( obj );
      //

      let cellMaterial;

      // init the Game of Life cells on gField
      for (let y = 0; y < gGame.HEIGHT; y++) {
        for (let x = 0; x < gGame.WIDTH; x++) {
          const isAlive = gGame.currCells.getCellState(x, y);
          cellMaterial = (isAlive) ? materials.isAlive : materials.isDead;

          // load cell, init positions, and add to scene
          console.log(bunnyGeom)
          const cell = new THREE.Mesh( bunnyGeom, cellMaterial ); 
          cell.position.set(x + 0.5, y + 0.5, 0.01);
          cell.isAlive = isAlive;

          gCells[x + y * gGame.HEIGHT] = cell;

          scene.add( cell );
        }
      }

      scene.add( new THREE.AxesHelper(200) ); // to be able to see the xyz axis

    },
    function( xhr ){
      console.log( (xhr.loaded / xhr.total * 100) + "% loaded")
    },
    function( err ){
      console.error( "Error loading 'big-buck-bunny.obj'")
    }
  );

  /*
  let loader = new THREE.BufferGeometryLoader();
    loader.load('big-buck-bunny.obj', (geom) => {
      bunnyGeom = geom;
    },
      function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ); 
      }
    );
  */

}

function updateCells() {
  for (let y = 0; y < gGame.HEIGHT; y++) {
    for (let x = 0; x < gGame.WIDTH; x++) {
      let cell = gCells[x + y * gGame.HEIGHT];
      let newState = gGame.currCells.getCellState(x, y);
      
      // if change to cell state, update material
      cell.material = (newState) ? materials.isAlive : materials.isDead;
      if (cell.isAlive !== newState) {
      }
    }
  }
}

export default Canvas;
