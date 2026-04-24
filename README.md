# Avantos Journey Builder — Prefill Configuration Challenge

A full-stack local dev setup for configuring field prefill mappings across forms in a DAG-based journey builder.

Forms are connected in a directed acyclic graph (DAG). The prefill system lets you map fields on a downstream form to values from any upstream form or global data source.

---

## Project structure

```
/
├── client/   # React + TypeScript frontend
└── server/   # Node.js mock API server
```

---

## Running locally

**1. Start the mock server**

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

1. On load, the client fetches a blueprint graph from the mock server (`GET /api/v1/1/actions/blueprints/test/graph`)
2. The left panel lists all form nodes in the graph. Click a form to open its prefill configuration.
3. The prefill panel shows all fields for the selected form (ordered by `ui_schema`). Click an unmapped field to open the data source picker.
4. The picker lists all available sources:
   - **Global sources** — Action Properties, Client Organisation Properties (always available)
   - **Upstream forms** — resolved by walking the DAG from the selected form back to its ancestors
5. Selecting a source field creates a mapping displayed as `fieldName: SourceForm.sourceField`. Click ✕ to clear it.
6. A toggle at the top of the panel enables or disables prefill for the form entirely.

---

## Mock server

The server is a minimal Node.js HTTP server with a single endpoint:

```
GET /api/v1/:tenantId/actions/blueprints/:blueprintId/graph
```

It serves `server/graph.json` — a static blueprint containing 6 form nodes (A–F) wired in a DAG:

```
Form A → Form B → Form D ↘
       ↘ Form C → Form E → Form F
```

Each form has a `field_schema`, `ui_schema`, and `dynamic_field_config`. Edit `graph.json` directly to customise the graph — changes take effect immediately without a server restart.

---

## Client structure

```
client/src/
  types.ts                  # All shared TypeScript interfaces
  services/api.ts           # Fetches the blueprint graph from the mock server
  hooks/
    useGraph.ts             # Loads and exposes graph data
    usePrefill.ts           # Manages per-form prefill mapping state and toggle
  utils/
    dag.ts                  # DAG traversal — getUpstreamNodes(nodeId, graph)
  components/
    FormList.tsx            # Left panel — lists all form nodes
    PrefillPanel.tsx        # Right panel — prefill config, field list, and toggle
    DataSourcePicker.tsx    # Modal — browse and select a data source field
  test/
    fixtures.ts             # Shared mock graph used across tests
    setup.ts                # vitest + jest-dom setup
```

---

## Adding a new data source

Data sources follow the `DataSource` interface in `client/src/types.ts`:

```ts
interface DataSource {
  id: string;
  label: string;
  fields: DataSourceField[];  // { id: string; label: string }[]
}
```

1. Define your source with a unique `id`, a human-readable `label`, and its `fields`.
2. Append it to `GLOBAL_SOURCES` in `PrefillPanel.tsx` for a static source, or derive it dynamically from the graph.
3. No other changes needed — the picker is fully data-driven.

**Example — adding a "Current User" source:**

```ts
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
