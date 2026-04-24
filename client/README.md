# Avantos Journey Builder — Prefill Configuration UI

A React + TypeScript app for configuring field prefill mappings across forms in a DAG-based journey builder. Forms are connected in a directed acyclic graph (DAG), and the prefill system lets you map fields on a downstream form to values from any upstream form or global data source.

## Getting started

**1. Start the mock API server** (required — see `server/README.md`)

```bash
cd server
npm install
node index.js
# Runs on http://localhost:3001
```

**2. Start the client**

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

**3. Run tests**

```bash
cd client
npm test -- --run
```

---

## How it works

1. On load, the app fetches a blueprint graph from the mock server (`GET /api/v1/1/actions/blueprints/test/graph`)
2. The left panel lists all form nodes in the graph. Click a form to open its prefill configuration.
3. The prefill panel shows all fields for the selected form (ordered by `ui_schema`). Click an unmapped field to open the data source picker.
4. The picker lists all available sources:
   - **Global sources** — Action Properties, Client Organisation Properties (always available)
   - **Upstream forms** — resolved by walking the DAG from the selected form back to its ancestors
5. Selecting a source field creates a mapping displayed as `fieldName: SourceForm.sourceField`. Click ✕ to clear it.
6. A toggle at the top of the panel enables or disables prefill for the form entirely.

---

## Adding a new data source

Data sources follow the `DataSource` interface in `src/types.ts`:

```ts
interface DataSource {
  id: string;
  label: string;
  fields: DataSourceField[];  // { id: string; label: string }[]
}
```

**Steps:**

1. Define your source as a `DataSource` object with a unique `id`, a human-readable `label`, and its `fields`.
2. Add it to the `GLOBAL_SOURCES` array in `PrefillPanel.tsx` (for static sources) or derive it dynamically from the graph.
3. No changes needed to `DataSourcePicker` or any other component — the picker is fully data-driven.

**Example — adding a "Current User" source:**

```ts
// In PrefillPanel.tsx, append to GLOBAL_SOURCES:
{
  id: "current_user",
  label: "Current User",
  fields: [
    { id: "current_user.id", label: "id" },
    { id: "current_user.email", label: "email" },
    { id: "current_user.role", label: "role" },
  ],
}
```

---

## Project structure

```
src/
  types.ts                  # All shared TypeScript interfaces (Graph, DataSource, PrefillMapping, etc.)
  services/
    api.ts                  # Fetches the blueprint graph from the mock server
  hooks/
    useGraph.ts             # Loads and exposes graph data + selected node state
    usePrefill.ts           # Manages per-form prefill mapping state and toggle
  utils/
    dag.ts                  # DAG traversal — getUpstreamNodes(nodeId, graph)
  components/
    FormList.tsx            # Left panel — lists all form nodes
    PrefillPanel.tsx        # Right panel — prefill config, field list, and toggle
    DataSourcePicker.tsx    # Modal — browse and select a data source field
  test/
    fixtures.ts             # Shared mock graph used across tests
    setup.ts                # jest-dom setup
```

---

## Notes

- The API base URL is configured in `src/services/api.ts`. It points to `http://localhost:3001` by default — make sure the server is running on that port.
- Field display order follows `ui_schema.elements` when present, falling back to `field_schema.properties` key order.
- The DAG traversal (`dag.ts`) walks `prerequisites` recursively, so transitive ancestors are included as data sources.
