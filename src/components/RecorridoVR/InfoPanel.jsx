import styles from "./RecorridoVR.module.css";

export default function InfoPanel({ hotspot, onClose }) {
  if (!hotspot) return null;

  return (
    <aside className={styles.infoPanel} role="dialog" aria-modal="true">
      <button className={styles.closeButton} type="button" onClick={onClose}>
        Cerrar
      </button>
      {hotspot.image ? (
        <img className={styles.infoImage} src={hotspot.image} alt="" />
      ) : null}
      <p className={styles.panelKicker}>Punto informativo</p>
      <h2>{hotspot.title || hotspot.label}</h2>
      <p>{hotspot.description}</p>
    </aside>
  );
}
