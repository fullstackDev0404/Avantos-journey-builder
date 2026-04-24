import type { Graph, GraphNode } from "../types";

/**
 * Returns all ancestor node IDs for a given node (direct + transitive),
 * by walking the prerequisites chain in the graph.
 */
export function getUpstreamNodes(nodeId: string, graph: Graph): GraphNode[] {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const result: GraphNode[] = [];

  function dfs(id: string) {
    const node = nodeMap.get(id);
    if (!node) return;
    for (const prereqId of node.data.prerequisites) {
      if (!visited.has(prereqId)) {
        visited.add(prereqId);
        const prereqNode = nodeMap.get(prereqId);
        if (prereqNode) result.push(prereqNode);
        dfs(prereqId);
      }
    }
  }

  dfs(nodeId);
  return result;
}
