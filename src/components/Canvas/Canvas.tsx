import {useEffect} from 'react';
import style from './Canvas.module.css';

interface CanvasProps { id: string, width: string, height: string };

const Canvas = (props: CanvasProps) => {
  
  const canvas = document.createElement("canvas");
  canvas.id = props.id;
  canvas.style.width = props.width;
  canvas.style.height = props.height;
  
  const existingCanvas = document.getElementById(canvas.id)
  if (existingCanvas && existingCanvas.parentElement) {
    existingCanvas.parentElement.removeChild(existingCanvas)
  }

  const initGL = () => {
    const gl = canvas.getContext("webgl");
    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);                  
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);                   
  
  }

  useEffect(() => {
    initGL();
    document.getElementById("canvas-container").appendChild(canvas);
  });

  return (
    <div id="canvas-container" className={style.Canvas}></div>
  );
}

export default Canvas;
