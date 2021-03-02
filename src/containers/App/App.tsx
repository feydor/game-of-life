import React from 'react';
import './App.css';

import * as GOL from '../../game/gameoflife';
import Canvas from '../../components/Canvas/Canvas';

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <Canvas id="canvas" width="720px" height="480px"/>
      </div>
    );
  }
}

export default App;
