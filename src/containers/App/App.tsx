import React from "react";
import "./App.css";

import Canvas from "../../components/Canvas/Canvas.jsx";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Canvas id="canvas" width={window.innerWidth} height={window.innerHeight} />
      </div>
    );
  }
}

export default App;
