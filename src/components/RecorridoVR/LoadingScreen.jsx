import styles from "./RecorridoVR.module.css";

export default function LoadingScreen({ visible, message = "Cargando recorrido" }) {
  return (
    <div
      className={`${styles.loading} ${visible ? styles.loadingVisible : ""}`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className={styles.loader} />
      <p>{message}</p>
    </div>
  );
}
