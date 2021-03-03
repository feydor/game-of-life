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
let then: number;
const inputManager = new InputManager();
const game = new GOL.Game();

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer; // it renders the camera on the scene 
let sphere: THREE.SphereGeometry;
let geometry: THREE.SphereGeometry;
let material: any;
let mesh: THREE.Mesh;
let gridTexture: THREE.Texture;

let field: THREE.WebGLRenderTarget[];

interface CanvasProps {
  id: string;
  width: number;
  height: number;
}

/**
 * for webgl rendering
 * @class Canvas
 */
const Canvas = (props: CanvasProps) => {
  
  const init = () => {
    // define a frustum
    const fov = 75;
    const aspect = props.width / props.height;
    const near = 0.1;
    const far = 3;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

    scene = new THREE.Scene();

    const radius = 1;
    const widthSegments = 24;
    const heightSegments = 10;
    sphere = new THREE.SphereGeometry(radius, widthSegments, heightSegments);;
    const loader = new THREE.TextureLoader();
    material = new THREE.MeshBasicMaterial({
      flatShading: true,
      map: loader.load('https://i.ibb.co/hCrpFfB/grid.jpg')
    });
    
    mesh = new THREE.Mesh( sphere, material );
    scene.add( mesh );
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( props.width, props.height );
    renderer.setAnimationLoop( render );
    let controls = new OrbitControls(camera, renderer.domElement);
  };

  useEffect(() => {
    init();
    document.getElementById("canvas-container").appendChild(renderer.domElement);
  });

  return <div id="canvas-container" className={style.Canvas}></div>;
};

/**
 * a single tick of rendering
 */
function render(now: number) {
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
    /*
    if (inputManager.isDown("ArrowRight")) mesh.rotation.y += globals.deltaRotation;
    if (inputManager.isDown("ArrowLeft")) mesh.rotation.y -= globals.deltaRotation;
    if (inputManager.isDown("ArrowUp")) mesh.rotation.x += globals.deltaRotation;
    if (inputManager.isDown("ArrowDown")) mesh.rotation.x -= globals.deltaRotation;
     */
  }

  // gameObjectManager.update()
  inputManager.update();
  renderer.render(scene, camera);
}

function resizeRendererToDisplaySize(renderer: any) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function gameToField(game: GOL.Game): THREE.Mesh[] {
  geometry = new THREE.SphereGeometry();
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
 */
function latLongToVector3(lat: number, lon: number, radius: number, height: number): THREE.Vector3 {
  let phi = (lat)*Math.PI/180;
  let theta = (lon-180)*Math.PI/180;

  var x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
  var y = (radius + height) * Math.sin(phi);
  var z = (radius + height) * Math.cos(phi) * Math.sin(theta);

  return new THREE.Vector3(x,y,z);
}

export default Canvas;
