// ─── Graph API types ──────────────────────────────────────────────────────────

export interface FieldSchema {
  type: string;
  avantos_type?: string;
  title?: string;
  format?: string;
  properties?: Record<string, FieldSchema>;
  items?: { enum?: string[]; type?: string };
  enum?: unknown[] | null;
  uniqueItems?: boolean;
}

export interface UiSchemaElement {
  type: string;
  scope?: string;
  label?: string;
  options?: Record<string, unknown>;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  is_reusable: boolean;
  field_schema: {
    type: string;
    properties: Record<string, FieldSchema>;
    required?: string[];
  };
  ui_schema?: {
    type: string;
    elements: UiSchemaElement[];
  };
  dynamic_field_config?: Record<string, unknown>;
}

export interface InputMappingEntry {
  type: string;       // e.g. "form_field"
  form_id: string;    // source node id
  field_id: string;   // source field key
}

export interface NodeData {
  id: string;
  component_key: string;
  component_type: string;
  component_id: string;
  name: string;
  prerequisites: string[];
  input_mapping: Record<string, InputMappingEntry>;
  permitted_roles: string[];
  sla_duration: { number: number; unit: string };
  approval_required: boolean;
  approval_roles: string[];
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface Graph {
  id: string;
  tenant_id?: string;
  name: string;
  description?: string;
  category?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  forms: FormDefinition[];
  branches: unknown[];
  triggers: unknown[];
}

// ─── Prefill types ────────────────────────────────────────────────────────────

/** Matches the shape of input_mapping entries in the graph API */
export interface PrefillMapping {
  type: string;       // "form_field"
  form_id: string;    // source node id
  field_id: string;   // source field key
  // Derived display helpers (not in API, computed client-side)
  sourceFormName?: string;
}

export type PrefillState = Record<string, PrefillMapping | null>;

// ─── Data source abstraction ──────────────────────────────────────────────────

export interface DataSourceField {
  id: string;   // unique key used as value
  label: string;
}

export interface DataSource {
  id: string;
  label: string;
  fields: DataSourceField[];
}
