import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataSourcePicker } from "./DataSourcePicker";
import type { DataSource } from "../types";

const sources: DataSource[] = [
  {
    id: "form-a",
    label: "Form A",
    fields: [
      { id: "form-a.email", label: "email" },
      { id: "form-a.name", label: "name" },
    ],
  },
  {
    id: "global",
    label: "Action Properties",
    fields: [{ id: "global.status", label: "status" }],
  },
];

describe("DataSourcePicker", () => {
  it("renders source labels", () => {
    render(<DataSourcePicker sources={sources} onSelect={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Form A")).toBeInTheDocument();
    expect(screen.getByText("Action Properties")).toBeInTheDocument();
  });

  it("expands a source and shows fields on click", () => {
    render(<DataSourcePicker sources={sources} onSelect={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText("Form A"));
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("name")).toBeInTheDocument();
  });

  it("SELECT button is disabled when nothing is selected", () => {
    render(<DataSourcePicker sources={sources} onSelect={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("SELECT")).toBeDisabled();
  });

  it("SELECT button enables after picking a field", () => {
    render(<DataSourcePicker sources={sources} onSelect={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText("Form A"));
    fireEvent.click(screen.getByText("email"));
    expect(screen.getByText("SELECT")).not.toBeDisabled();
  });

  it("calls onSelect with correct field and source when SELECT is clicked", () => {
    const onSelect = vi.fn();
    render(<DataSourcePicker sources={sources} onSelect={onSelect} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText("Form A"));
    fireEvent.click(screen.getByText("email"));
    fireEvent.click(screen.getByText("SELECT"));
    expect(onSelect).toHaveBeenCalledWith(
      { id: "form-a.email", label: "email" },
      sources[0]
    );
  });

  it("calls onCancel when CANCEL is clicked", () => {
    const onCancel = vi.fn();
    render(<DataSourcePicker sources={sources} onSelect={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("CANCEL"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("filters sources by search query", () => {
    render(<DataSourcePicker sources={sources} onSelect={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "email" } });
    expect(screen.getByText("email")).toBeInTheDocument();
    // "status" from Action Properties should not appear since it doesn't match
    expect(screen.queryByText("status")).not.toBeInTheDocument();
  });
});
