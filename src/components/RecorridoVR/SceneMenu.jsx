import styles from "./RecorridoVR.module.css";

export default function SceneMenu({ nodes, currentNodeId, onSelect }) {
  return (
    <nav className={styles.sceneMenu} aria-label="Puntos del recorrido">
      {nodes.map((node) => (
        <button
          className={node.id === currentNodeId ? styles.activeScene : ""}
          type="button"
          key={node.id}
          onClick={() => onSelect(node.id)}
        >
          <span>{node.title}</span>
          <small>{node.subtitle}</small>
        </button>
      ))}
    </nav>
  );
}
