import { useState, useCallback } from "react";
import type { PrefillMapping, PrefillState, GraphNode } from "../types";

interface UsePrefillResult {
  /** Per-node prefill mappings: nodeId → { fieldKey → mapping } */
  prefillByNode: Record<string, PrefillState>;
  /** Per-node enabled toggle: nodeId → boolean */
  enabledByNode: Record<string, boolean>;
  setMapping: (nodeId: string, field: string, mapping: PrefillMapping) => void;
  clearMapping: (nodeId: string, field: string) => void;
  setEnabled: (nodeId: string, enabled: boolean) => void;
  /** Seed initial state from graph node input_mapping on first load */
  initFromNodes: (nodes: GraphNode[]) => void;
}

export function usePrefill(): UsePrefillResult {
  const [prefillByNode, setPrefillByNode] = useState<Record<string, PrefillState>>({});
  const [enabledByNode, setEnabledByNode] = useState<Record<string, boolean>>({});

  const initFromNodes = useCallback((nodes: GraphNode[]) => {
    setPrefillByNode((prev) => {
      // Only seed nodes not yet tracked
      const next = { ...prev };
      for (const node of nodes) {
        if (!(node.id in next)) {
          const state: PrefillState = {};
          for (const [field, entry] of Object.entries(node.data.input_mapping)) {
            state[field] = entry;
          }
          next[node.id] = state;
        }
      }
      return next;
    });
    setEnabledByNode((prev) => {
      const next = { ...prev };
      for (const node of nodes) {
        if (!(node.id in next)) {
          // Enable prefill by default if the node already has any mappings
          next[node.id] = Object.keys(node.data.input_mapping).length > 0;
        }
      }
      return next;
    });
  }, []);

  function setMapping(nodeId: string, field: string, mapping: PrefillMapping) {
    setPrefillByNode((prev) => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], [field]: mapping },
    }));
  }

  function clearMapping(nodeId: string, field: string) {
    setPrefillByNode((prev) => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], [field]: null },
    }));
  }

  function setEnabled(nodeId: string, enabled: boolean) {
    setEnabledByNode((prev) => ({ ...prev, [nodeId]: enabled }));
  }

  return { prefillByNode, enabledByNode, setMapping, clearMapping, setEnabled, initFromNodes };
}
