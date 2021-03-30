import React from "react";
import styles from "./App.module.css";
import Canvas from "../../components/Canvas/Canvas.jsx";
import UI from "../../components/UI/UI.jsx";
import {
  handlePlayEvent,
  handlePauseEvent,
  handleLoadEvent,
  handleViewChange,
  handleResetEvent,
  handleLayoutChange,
} from "../../components/GameState/GameState";

class App extends React.Component {
  render() {
    return (
      <div className={styles.container}>
        <Canvas
          id="canvas"
          width={window.innerWidth}
          height={window.innerHeight}
        />
        <UI
          handlePlayEvent={handlePlayEvent}
          handlePauseEvent={handlePauseEvent}
          handleLoadEvent={handleLoadEvent}
          handleViewChange={handleViewChange}
          handleResetEvent={handleResetEvent}
          handleLayoutChange={handleLayoutChange}
        />
      </div>
    );
  }
}

export default App;
