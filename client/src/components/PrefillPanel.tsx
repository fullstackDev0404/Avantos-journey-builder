import { useState, useMemo } from "react";
import type {
  Graph,
  GraphNode,
  PrefillMapping,
  PrefillState,
  DataSource,
  DataSourceField,
} from "../types";
import { getUpstreamNodes } from "../utils/dag";
import { DataSourcePicker } from "./DataSourcePicker";
import styles from "./PrefillPanel.module.css";

// Global data sources always available regardless of form position in the DAG.
// To add a new global source, append an entry here — no other changes needed.
const GLOBAL_SOURCES: DataSource[] = [
  {
    id: "action_properties",
    label: "Action Properties",
    fields: [
      { id: "action_properties.id", label: "id" },
      { id: "action_properties.name", label: "name" },
      { id: "action_properties.status", label: "status" },
    ],
  },
  {
    id: "client_org_properties",
    label: "Client Organisation Properties",
    fields: [
      { id: "client_org_properties.id", label: "id" },
      { id: "client_org_properties.name", label: "name" },
      { id: "client_org_properties.email", label: "email" },
    ],
  },
];

interface Props {
  selectedNode: GraphNode | null;
  graph: Graph | null;
  prefill: PrefillState;
  prefillEnabled: boolean;
  onSetEnabled: (enabled: boolean) => void;
  onSetMapping: (field: string, mapping: PrefillMapping) => void;
  onClearMapping: (field: string) => void;
}

export function PrefillPanel({
  selectedNode,
  graph,
  prefill,
  prefillEnabled,
  onSetEnabled,
  onSetMapping,
  onClearMapping,
}: Props) {
  const [activeField, setActiveField] = useState<string | null>(null);

  // Build data sources: globals + all upstream forms resolved via DAG
  const dataSources: DataSource[] = useMemo(() => {
    if (!selectedNode || !graph) return GLOBAL_SOURCES;

    const upstreamNodes = getUpstreamNodes(selectedNode.id, graph);
    const formSources: DataSource[] = upstreamNodes.map((node) => {
      const formDef = graph.forms.find((f) => f.id === node.data.component_id);
      const fields: DataSourceField[] = formDef
        ? Object.keys(formDef.field_schema.properties).map((key) => ({
            id: `${node.id}.${key}`,
            label: key,
          }))
        : [];
      return { id: node.id, label: node.data.name, fields };
    });

    return [...GLOBAL_SOURCES, ...formSources];
  }, [selectedNode, graph]);

  // Respect ui_schema element order; fall back to field_schema key order
  const currentFields = useMemo(() => {
    if (!selectedNode || !graph) return [];
    const formDef = graph.forms.find(
      (f) => f.id === selectedNode.data.component_id
    );
    if (!formDef) return [];

    const schemaKeys = Object.keys(formDef.field_schema.properties);
    const uiElements = formDef.ui_schema?.elements ?? [];

    if (uiElements.length > 0) {
      // Extract field keys from ui_schema scope strings like "#/properties/email"
      const ordered = uiElements  
        .map((el: { scope?: string }) => el.scope?.split("/").pop())
        .filter((k): k is string => !!k && schemaKeys.includes(k));
      // Append any schema keys not covered by ui_schema
      const covered = new Set(ordered);
      const rest = schemaKeys.filter((k) => !covered.has(k));
      return [...ordered, ...rest];
    }

    return schemaKeys;
  }, [selectedNode, graph]);

  if (!selectedNode) {
    return (
      <p className={styles.placeholder}>Select a form to configure prefill</p>
    );
  }

  function handlePickerSelect(field: DataSourceField, source: DataSource) {
    if (!activeField) return;
    const dotIndex = field.id.indexOf(".");
    const form_id = field.id.substring(0, dotIndex);
    const field_id = field.id.substring(dotIndex + 1);
    onSetMapping(activeField, {
      type: "form_field",
      form_id,
      field_id,
      sourceFormName: source.label,
    });
    setActiveField(null);
  }

  return (
    <div className={styles.container}>
      {/* Header with toggle */}
      <div className={styles.header}>
        <div>
          <p className={styles.headerTitle}>Prefill</p>
          <p className={styles.headerSub}>Prefill fields for this form</p>
        </div>
        <label className={styles.toggle} aria-label="Enable prefill">
          <input
            type="checkbox"
            checked={prefillEnabled}
            onChange={(e) => onSetEnabled(e.target.checked)}
          />
          <span className={styles.slider} />
        </label>
      </div>

      {prefillEnabled && (
        <ul className={styles.fieldList}>
          {currentFields.map((field) => {
            const mapping = prefill[field];
            return (
              <li key={field} className={styles.fieldRow}>
                {mapping ? (
                  <div className={styles.mappedRow}>
                    <span className={styles.mappedLabel}>
                      {field}: {mapping.sourceFormName ?? mapping.form_id}.
                      {mapping.field_id}
                    </span>
                    <button
                      className={styles.clearBtn}
                      onClick={() => onClearMapping(field)}
                      aria-label={`Clear mapping for ${field}`}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.emptyField}
                    onClick={() => setActiveField(field)}
                    aria-label={`Set prefill for ${field}`}
                  >
                    <span className={styles.fieldIcon}>⊟</span>
                    {field}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {activeField && (
        <DataSourcePicker
          sources={dataSources}
          onSelect={handlePickerSelect}
          onCancel={() => setActiveField(null)}
        />
      )}
    </div>
  );
}
