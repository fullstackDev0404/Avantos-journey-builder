import { useEffect, useState } from "react";
import { fetchGraph } from "../services/api";
import type { Graph, GraphNode } from "../types";

interface UseGraphResult {
  graph: Graph | null;
  nodes: GraphNode[];
  loading: boolean;
  error: string | null;
}

export function useGraph(): UseGraphResult {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGraph()
      .then((data) => {
        setGraph(data);
        setNodes(data.nodes);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load graph");
      })
      .finally(() => setLoading(false));
  }, []);

  return { graph, nodes, loading, error };
}
