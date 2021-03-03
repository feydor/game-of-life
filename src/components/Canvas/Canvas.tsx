import { useEffect } from "react";
import * as THREE from 'three';
import style from "./Canvas.module.css";
import * as GOL from "../../game/gameoflife";

import InputManager from "../InputManager/InputManager";

// globals
const globals = {
  time: 0,
  deltaTime: 0,
};
let then: number;
const inputManager = new InputManager();
const game = new GOL.Game();

let camera: any;
let scene: any;
let renderer: any; // it renders the camera on the scene 
let sphere: any;
let geometry: any;
let material: any;
let mesh: any;

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
    material = new THREE.MeshNormalMaterial({
      flatShading: true
    });
    
    mesh = new THREE.Mesh( sphere, material );
    scene.add( mesh );
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( props.width, props.height );
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
 */
function render(now: number) {
  globals.time  = now * 0.001; // to seconds
  globals.deltaTime = Math.min(globals.time - then, 1 / 20); // limit deltaTime
  then = globals.time;
  
  mesh.rotation.x = globals.time;
  mesh.rotation.y = globals.time / 2000;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // update GoL state
  {
    if (inputManager.isDown("Enter")) game.update(); 
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

export default Canvas;
