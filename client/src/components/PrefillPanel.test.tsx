import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PrefillPanel } from "./PrefillPanel";
import { mockGraph } from "../test/fixtures";

const nodeA = mockGraph.nodes[0]; // Form A — root, no upstream
const nodeB = mockGraph.nodes[1]; // Form B — depends on Form A
const nodeC = mockGraph.nodes[2]; // Form C — depends on Form B (transitive: A)

const baseProps = {
  graph: mockGraph,
  prefill: {},
  prefillEnabled: true,
  onSetEnabled: vi.fn(),
  onSetMapping: vi.fn(),
  onClearMapping: vi.fn(),
};

describe("PrefillPanel", () => {
  it("shows placeholder when no form is selected", () => {
    render(<PrefillPanel {...baseProps} selectedNode={null} />);
    expect(screen.getByText(/select a form/i)).toBeInTheDocument();
  });

  it("renders fields for the selected form in ui_schema order", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeA} />);
    const buttons = screen.getAllByRole("button", { name: /set prefill/i });
    // ui_schema order for form-a is: name, email
    expect(buttons[0]).toHaveAccessibleName("Set prefill for name");
    expect(buttons[1]).toHaveAccessibleName("Set prefill for email");
  });

  it("shows the prefill toggle", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeA} />);
    expect(screen.getByLabelText("Enable prefill")).toBeInTheDocument();
  });

  it("calls onSetEnabled when toggle is clicked", () => {
    const onSetEnabled = vi.fn();
    render(<PrefillPanel {...baseProps} selectedNode={nodeA} onSetEnabled={onSetEnabled} />);
    fireEvent.click(screen.getByLabelText("Enable prefill"));
    expect(onSetEnabled).toHaveBeenCalledWith(false);
  });

  it("hides field list when prefill is disabled", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeA} prefillEnabled={false} />);
    expect(screen.queryByRole("button", { name: /set prefill/i })).not.toBeInTheDocument();
  });

  it("opens DataSourcePicker when an empty field is clicked", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeB} />);
    fireEvent.click(screen.getByLabelText("Set prefill for email"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes picker when CANCEL is clicked", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeB} />);
    fireEvent.click(screen.getByLabelText("Set prefill for email"));
    fireEvent.click(screen.getByText("CANCEL"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows mapped label when a field has a mapping", () => {
    const prefill = {
      email: { type: "form_field", form_id: "form-a", field_id: "email", sourceFormName: "Form A" },
    };
    render(<PrefillPanel {...baseProps} selectedNode={nodeB} prefill={prefill} />);
    expect(screen.getByText("email: Form A.email")).toBeInTheDocument();
  });

  it("calls onClearMapping when X button is clicked", () => {
    const onClearMapping = vi.fn();
    const prefill = {
      email: { type: "form_field", form_id: "form-a", field_id: "email", sourceFormName: "Form A" },
    };
    render(
      <PrefillPanel
        {...baseProps}
        selectedNode={nodeB}
        prefill={prefill}
        onClearMapping={onClearMapping}
      />
    );
    fireEvent.click(screen.getByLabelText("Clear mapping for email"));
    expect(onClearMapping).toHaveBeenCalledWith("email");
  });

  it("picker shows upstream forms for a node with ancestors", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeC} />);
    fireEvent.click(screen.getByLabelText("Set prefill for email"));
    // Form B is a direct upstream of Form C
    expect(screen.getByText("Form B")).toBeInTheDocument();
    // Form A is a transitive upstream
    expect(screen.getByText("Form A")).toBeInTheDocument();
  });

  it("picker shows global sources for all forms", () => {
    render(<PrefillPanel {...baseProps} selectedNode={nodeA} />);
    fireEvent.click(screen.getByLabelText("Set prefill for email"));
    expect(screen.getByText("Action Properties")).toBeInTheDocument();
    expect(screen.getByText("Client Organisation Properties")).toBeInTheDocument();
  });

  it("calls onSetMapping with correct shape when a field is selected in picker", () => {
    const onSetMapping = vi.fn();
    render(
      <PrefillPanel
        {...baseProps}
        selectedNode={nodeC}
        onSetMapping={onSetMapping}
      />
    );
    fireEvent.click(screen.getByLabelText("Set prefill for email"));
    const dialog = screen.getByRole("dialog");
    // Search to auto-expand Form B
    fireEvent.change(screen.getByPlaceholderText("Search"), { target: { value: "Form B" } });
    // Pick the email field inside the dialog
    const emailOptions = Array.from(dialog.querySelectorAll("li[role='option']")).filter(
      (el) => el.textContent === "email"
    );
    expect(emailOptions.length).toBeGreaterThan(0);
    fireEvent.click(emailOptions[0]);
    fireEvent.click(screen.getByText("SELECT"));
    expect(onSetMapping).toHaveBeenCalledWith(
      "email",
      expect.objectContaining({
        type: "form_field",
        form_id: "form-b",
        field_id: "email",
        sourceFormName: "Form B",
      })
    );
  });
});
