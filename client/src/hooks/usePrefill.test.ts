import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrefill } from "./usePrefill";
import { mockGraph } from "../test/fixtures";

const mapping = {
  type: "form_field",
  form_id: "form-a",
  field_id: "email",
  sourceFormName: "Form A",
};

describe("usePrefill", () => {
  it("starts with empty state", () => {
    const { result } = renderHook(() => usePrefill());
    expect(result.current.prefillByNode).toEqual({});
    expect(result.current.enabledByNode).toEqual({});
  });

  it("sets a mapping for a node field", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.setMapping("form-b", "email", mapping));
    expect(result.current.prefillByNode["form-b"]["email"]).toEqual(mapping);
  });

  it("clears a mapping for a node field", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.setMapping("form-b", "email", mapping));
    act(() => result.current.clearMapping("form-b", "email"));
    expect(result.current.prefillByNode["form-b"]["email"]).toBeNull();
  });

  it("preserves other fields when clearing one", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.setMapping("form-b", "email", mapping));
    act(() => result.current.setMapping("form-b", "name", { ...mapping, field_id: "name" }));
    act(() => result.current.clearMapping("form-b", "email"));
    expect(result.current.prefillByNode["form-b"]["email"]).toBeNull();
    expect(result.current.prefillByNode["form-b"]["name"]).not.toBeNull();
  });

  it("preserves other nodes when updating one", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.setMapping("form-a", "email", mapping));
    act(() => result.current.setMapping("form-b", "email", mapping));
    act(() => result.current.clearMapping("form-a", "email"));
    expect(result.current.prefillByNode["form-b"]["email"]).toEqual(mapping);
  });

  it("sets and reads enabled state per node", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.setEnabled("form-a", true));
    expect(result.current.enabledByNode["form-a"]).toBe(true);
    act(() => result.current.setEnabled("form-a", false));
    expect(result.current.enabledByNode["form-a"]).toBe(false);
  });

  it("initFromNodes seeds state from node input_mapping", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.initFromNodes(mockGraph.nodes));
    // form-c has a pre-seeded email mapping in fixtures
    expect(result.current.prefillByNode["form-c"]["email"]).toMatchObject({
      type: "form_field",
      form_id: "form-a",
      field_id: "email",
    });
  });

  it("initFromNodes enables prefill for nodes that have existing mappings", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.initFromNodes(mockGraph.nodes));
    expect(result.current.enabledByNode["form-c"]).toBe(true);
    expect(result.current.enabledByNode["form-a"]).toBe(false);
  });

  it("initFromNodes does not overwrite already-tracked nodes", () => {
    const { result } = renderHook(() => usePrefill());
    act(() => result.current.setMapping("form-a", "email", mapping));
    act(() => result.current.initFromNodes(mockGraph.nodes));
    // form-a was already tracked, so its state should not be reset
    expect(result.current.prefillByNode["form-a"]["email"]).toEqual(mapping);
  });
});
