import styles from "./RecorridoVR.module.css";

export default function LoadingScreen({ visible, message = "Cargando recorrido" }) {
  if (!visible) return null;

  return (
    <div className={styles.loading} aria-live="polite">
      <div className={styles.loader} />
      <p>{message}</p>
    </div>
  );
}
