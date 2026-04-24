import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormList } from "./FormList";
import { mockGraph } from "../test/fixtures";

const nodes = mockGraph.nodes;

describe("FormList", () => {
  it("renders all form names", () => {
    render(<FormList nodes={nodes} selectedNodeId={null} onSelect={vi.fn()} />);
    expect(screen.getByText("Form A")).toBeInTheDocument();
    expect(screen.getByText("Form B")).toBeInTheDocument();
    expect(screen.getByText("Form C")).toBeInTheDocument();
  });

  it("calls onSelect with the correct node when clicked", () => {
    const onSelect = vi.fn();
    render(<FormList nodes={nodes} selectedNodeId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("Form B"));
    expect(onSelect).toHaveBeenCalledWith(nodes[1]);
  });

  it("marks the selected node visually", () => {
    render(<FormList nodes={nodes} selectedNodeId="form-a" onSelect={vi.fn()} />);
    const item = screen.getByText("Form A").closest("li");
    expect(item?.className).toMatch(/selected/);
  });

  it("renders empty list without crashing", () => {
    render(<FormList nodes={[]} selectedNodeId={null} onSelect={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
