import type { Graph } from "../types";

export const mockGraph: Graph = {
  id: "bp_test",
  name: "Test Blueprint",
  branches: [],
  triggers: [],
  nodes: [
    {
      id: "form-a",
      type: "form",
      position: { x: 0, y: 0 },
      data: {
        id: "bp_c_a",
        component_key: "form-a",
        component_type: "form",
        component_id: "f_form_a",
        name: "Form A",
        prerequisites: [],
        input_mapping: {},
        permitted_roles: [],
        sla_duration: { number: 0, unit: "minutes" },
        approval_required: false,
        approval_roles: [],
      },
    },
    {
      id: "form-b",
      type: "form",
      position: { x: 200, y: 0 },
      data: {
        id: "bp_c_b",
        component_key: "form-b",
        component_type: "form",
        component_id: "f_form_b",
        name: "Form B",
        prerequisites: ["form-a"],
        input_mapping: {},
        permitted_roles: [],
        sla_duration: { number: 0, unit: "minutes" },
        approval_required: false,
        approval_roles: [],
      },
    },
    {
      id: "form-c",
      type: "form",
      position: { x: 400, y: 0 },
      data: {
        id: "bp_c_c",
        component_key: "form-c",
        component_type: "form",
        component_id: "f_form_b",
        name: "Form C",
        prerequisites: ["form-b"],
        input_mapping: {
          // Pre-seeded mapping to test initFromNodes
          email: { type: "form_field", form_id: "form-a", field_id: "email" },
        },
        permitted_roles: [],
        sla_duration: { number: 0, unit: "minutes" },
        approval_required: false,
        approval_roles: [],
      },
    },
  ],
  edges: [
    { source: "form-a", target: "form-b" },
    { source: "form-b", target: "form-c" },
  ],
  forms: [
    {
      id: "f_form_a",
      name: "Form A Def",
      description: "",
      is_reusable: false,
      field_schema: {
        type: "object",
        properties: {
          email: { type: "string", avantos_type: "short-text", title: "Email" },
          name: { type: "string", avantos_type: "short-text", title: "Name" },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          { type: "Control", scope: "#/properties/name", label: "Name" },
          { type: "Control", scope: "#/properties/email", label: "Email" },
        ],
      },
    },
    {
      id: "f_form_b",
      name: "Form B Def",
      description: "",
      is_reusable: false,
      field_schema: {
        type: "object",
        properties: {
          email: { type: "string", avantos_type: "short-text", title: "Email" },
          notes: { type: "string", avantos_type: "multi-line-text", title: "Notes" },
        },
      },
      ui_schema: {
        type: "VerticalLayout",
        elements: [
          { type: "Control", scope: "#/properties/email", label: "Email" },
          { type: "Control", scope: "#/properties/notes", label: "Notes" },
        ],
      },
    },
  ],
};
