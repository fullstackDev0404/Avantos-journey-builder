import type { GraphNode } from "../types";
import styles from "./FormList.module.css";

interface Props {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelect: (node: GraphNode) => void;
}

export function FormList({ nodes, selectedNodeId, onSelect }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Forms</h2>
      <ul className={styles.list}>
        {nodes.map((node) => (
          <li
            key={node.id}
            className={`${styles.item} ${node.id === selectedNodeId ? styles.selected : ""}`}
            onClick={() => onSelect(node)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(node)}
            aria-pressed={node.id === selectedNodeId}
          >
            {node.data.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
