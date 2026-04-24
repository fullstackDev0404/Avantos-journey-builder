import { useState, useEffect } from "react";
import { useGraph } from "./hooks/useGraph";
import { usePrefill } from "./hooks/usePrefill";
import { FormList } from "./components/FormList";
import { PrefillPanel } from "./components/PrefillPanel";
import type { GraphNode } from "./types";
import "./App.css";

function App() {
  const { graph, nodes, loading, error } = useGraph();
  const { prefillByNode, enabledByNode, setMapping, clearMapping, setEnabled, initFromNodes } = usePrefill();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Seed prefill state from graph input_mapping once nodes are loaded
  useEffect(() => {
    if (nodes.length > 0) initFromNodes(nodes);
  }, [nodes, initFromNodes]);

  if (loading) return <div className="status">Loading...</div>;
  if (error) return <div className="status error">Error: {error}</div>;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Journey Builder — Prefill Configuration</h1>
      </header>

      <main className="app-body">
        <FormList
          nodes={nodes}
          selectedNodeId={selectedNode?.id ?? null}
          onSelect={setSelectedNode}
        />

        <PrefillPanel
          selectedNode={selectedNode}
          graph={graph}
          prefill={selectedNode ? (prefillByNode[selectedNode.id] ?? {}) : {}}
          prefillEnabled={selectedNode ? (enabledByNode[selectedNode.id] ?? false) : false}
          onSetEnabled={(enabled) => selectedNode && setEnabled(selectedNode.id, enabled)}
          onSetMapping={(field, mapping) => selectedNode && setMapping(selectedNode.id, field, mapping)}
          onClearMapping={(field) => selectedNode && clearMapping(selectedNode.id, field)}
        />
      </main>
    </div>
  );
}

export default App;
