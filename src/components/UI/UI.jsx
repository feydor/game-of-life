import styles from "./UI.module.css";

const UI = (props) => {
  return (
    <div id="ui" className={styles.ui}>
      <div id="play" onClick={props.handlePlayEvent} className={styles.button}>
        <img src="play.jpg" alt="play button" />
      </div>

      <div
        id="pause"
        onClick={props.handlePauseEvent}
        className={styles.button}
      >
        <img src="pause.jpg" alt="pause button" />
      </div>

      <div
        id="reset"
        onClick={props.handleResetEvent}
        className={styles.button}
      >
        <img src="reset.png" alt="pause button" />
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
        <label htmlFor="trail">Trail</label>
        <input
          type="checkbox"
          name="trail"
          value="trail"
          id="trail"
          onChange={props.handleLayoutChange}
        />
        <label htmlFor="colors">Colors</label>
        <input
          type="checkbox"
          name="colors"
          value="colors"
          id="colors"
          onChange={props.handleLayoutChange}
        />
      </div>
    </div>
  );
};

export default UI;
