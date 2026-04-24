import { describe, it, expect } from "vitest";
import { getUpstreamNodes } from "./dag";
import { mockGraph } from "../test/fixtures";

describe("getUpstreamNodes", () => {
  it("returns empty array for a root node with no prerequisites", () => {
    const result = getUpstreamNodes("form-a", mockGraph);
    expect(result).toHaveLength(0);
  });

  it("returns direct parent for a node with one prerequisite", () => {
    const result = getUpstreamNodes("form-b", mockGraph);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("form-a");
  });

  it("returns all ancestors (transitive) for a deeply nested node", () => {
    const result = getUpstreamNodes("form-c", mockGraph);
    const ids = result.map((n) => n.id);
    expect(ids).toContain("form-b");
    expect(ids).toContain("form-a");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when graph has no nodes", () => {
    const emptyGraph = { ...mockGraph, nodes: [], edges: [], forms: [] };
    const result = getUpstreamNodes("form-a", emptyGraph);
    expect(result).toHaveLength(0);
  });

  it("does not include the node itself in the result", () => {
    const result = getUpstreamNodes("form-c", mockGraph);
    const ids = result.map((n) => n.id);
    expect(ids).not.toContain("form-c");
  });
});
