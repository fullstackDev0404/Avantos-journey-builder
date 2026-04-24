# Avantos Prefill — Journey Builder Challenge

A React + TypeScript app that lets you configure prefill mappings for forms in a DAG-based journey builder.

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
npm test
```

---

## How it works

- The app fetches a blueprint graph from the mock server (`GET /api/v1/1/actions/blueprints/test/graph`)
- Forms are listed on the left. Click a form to open its prefill configuration panel.
- The prefill panel shows all fields for the selected form. Click an empty field to open the data source picker modal.
- The picker shows all available data sources: global sources (Action Properties, Client Organisation Properties) and upstream forms resolved by traversing the DAG.
- Selecting a field from the picker maps it. The mapping is shown as `fieldName: SourceForm.sourceField`. Click ✕ to clear it.
- A toggle at the top of the panel enables/disables prefill for the form.

---

## How to add a new data source

Data sources follow the `DataSource` interface defined in `src/types.ts`:

```ts
interface DataSource {
  id: string;
  label: string;
  fields: DataSourceField[];  // { id: string; label: string }[]
}
```

**Steps:**

1. Define your new source as a `DataSource` object with a unique `id`, a human-readable `label`, and its `fields`.
2. Add it to the `dataSources` array in `PrefillPanel.tsx` — either statically (like the existing `GLOBAL_SOURCES`) or dynamically derived from the graph/API.
3. No changes needed to `DataSourcePicker` or any other component — the picker is fully data-driven.

**Example — adding a "Current User" source:**

```ts
// In PrefillPanel.tsx, add to GLOBAL_SOURCES:
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

That's it — it will automatically appear in the picker modal.

---

## Project structure

```
src/
  types.ts                  # All shared TypeScript interfaces
  services/api.ts           # API call to mock server
  hooks/
    useGraph.ts             # Fetches and exposes graph data
    usePrefill.ts           # Manages prefill mapping state
  utils/
    dag.ts                  # DAG traversal (getUpstreamNodes)
  components/
    FormList.tsx            # Left panel — list of forms
    PrefillPanel.tsx        # Right panel — prefill config + toggle
    DataSourcePicker.tsx    # Modal — pick a data source field
  test/
    fixtures.ts             # Shared mock graph for tests
    setup.ts                # jest-dom setup
```
