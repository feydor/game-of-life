import React from "react";
import "./App.css";

import Canvas from "../../components/Canvas/Canvas";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Canvas id="canvas" width={720} height={480} />
      </div>
    );
  }
}

export default App;
