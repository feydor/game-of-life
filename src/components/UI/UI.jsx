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
      <div id="load">
        <select>
          <option value="random">Random</option>
          <option value="gun">Gosper glider gun</option>
        </select>
      </div>
    </div>
  );
}

export default UI;
