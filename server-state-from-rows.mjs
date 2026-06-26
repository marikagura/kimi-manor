// Bridge kimi's data to the cc-gild STATE-SCHEMA.
//
// The OSS ships the DEMO (state.sample.json) + the rendering (cc-gild-v7.html) +
// the contract (STATE-SCHEMA.md). It deliberately does NOT ship an opinionated
// mapping from raw rows to panels — that binding is personal and differs per
// person, so baking one in would impose one author's data model on everyone:
//   - finance: your own categories / model (no two people budget alike)
//   - sleep:   your own pipeline — e.g. an iOS Shortcut that estimates hours
//   - sky:     the constellation is a RENDER; bind your own memory points to it
//   - memory:  connect your own source
//
// So mapToState() ships as a STUB returning {} → every panel stays on the demo.
// Fill in only the panels you want, in YOUR shape (see STATE-SCHEMA.md for each
// panel's fields). The result is a PARTIAL state; the front deep-merges it over
// the inlined demo, so anything you don't map keeps the placeholder.

function toIso(v) {
  if (v instanceof Date) return v.toISOString();
  return typeof v === "string" ? v : String(v ?? "");
}

// Generic plumbing — pg rows [{ id, collection, data, created_at, updated_at }]
// reconstructed to { collection: entry[] }. No interpretation of what the rows mean.
export function groupRows(rows) {
  const out = {};
  for (const r of rows || []) {
    const data = r && r.data && typeof r.data === "object" ? r.data : {};
    const entry = { ...data, id: r.id, createdAt: toIso(r.created_at), updatedAt: toIso(r.updated_at) };
    (out[r.collection] ??= []).push(entry);
  }
  return out;
}

// snapshot: Tier 1 passes { store: groupRows(rows) }; Tier 2 passes kimi-core's
// neutral state_snapshot ({ store, profile, states, memoryStats, ... }).
//
// Return a PARTIAL STATE-SCHEMA object. Ships {} (→ demo). Example of mapping ONE
// panel — in YOUR shape, uncomment / adapt:
//
//   const sleep = snapshot?.store?.sleep ?? [];           // your own sleep rows
//   return { comps: { sleep: { nights: sleep.map((s) => ({ label: s.date, hrs: s.hrs })) } } };
//
export function mapToState(snapshot) {
  void snapshot; // your data, your mapping — see the example above and STATE-SCHEMA.md
  return {};
}
