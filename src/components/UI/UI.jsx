import styles from "./UI.module.css";

const UI = (props) => {
  return (
    <div id="ui" className={styles.ui}>

      <div id="play" onClick={props.handlePlayEvent} className={styles.button}>
        <img src="play.jpg" alt="play button"/>
      </div>

      <div id="pause" onClick={props.handlePauseEvent} className={styles.button}>
        <img src="pause.jpg" alt="pause button" />
      </div>

      <div id="load" className={styles.load}>
        <select defaultValue="random" onChange={props.handleLoadEvent}>
          <option value="random">Random</option>
          <option value="gun">Gosper glider gun</option>
          <option value="acorn">Acorn</option>
        </select>
      </div>
      
      <div id="perspective" className={styles.perspective}>
        <button onClick={props.handleViewChange}>Change View</button>
      </div>

      <div id="layout" className={styles.layout}>
        <label for="trail">Trail</label>
        <input type="checkbox" name="trail" value="trail" />
        <label for="colors">Colors</label>
        <input type="checkbox" name="colors" value="colors" />
      </div>

    </div>
  );
}

export default UI;
