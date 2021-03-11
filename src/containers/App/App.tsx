import React from "react";
import styles from "./App.module.css";
import Canvas from "../../components/Canvas/Canvas.jsx";
import UI from "../../components/UI/UI.jsx";
import { handlePlayEvent, handlePauseEvent } from "../../components/GameState/GameState";

class App extends React.Component {
  render() {
    return (
      <div className={styles.container}>
        <Canvas id="canvas" width={window.innerWidth} height={window.innerHeight} />
        <UI handlePlayEvent={handlePlayEvent} handlePauseEvent={handlePauseEvent} />
      </div>
    );
  }
}

export default App;
