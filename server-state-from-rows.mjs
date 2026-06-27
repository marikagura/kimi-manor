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
// So mapToState() ships a DEFAULT binding for the `review` panel (kimi-core
// state_snapshot → Memory & Review, below); every other panel stays on the demo.
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
// Default binding for the `review` panel (Memory & Review): map kimi-core's neutral
// state_snapshot (Tier 2) → open pending items + active states + the 30 newest
// memories (all types except RESTRICTED), in that order — the same three things
// kimi-room's memory-review shows. A sensible default, NOT a mandate: it only fires
// with a core (KIMI_CORE_URL + KIMI_EXTENSIONS=store); without one the snapshot
// lacks these fields → {} → the panel keeps its demo. Re-map any panel in YOUR shape.
export function mapToState(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return {};
  const clamp5 = (n) => Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  const ts = (iso) =>
    typeof iso === "string" ? iso.slice(0, 16).replace("T", " ").replace(/-/g, ".") : "";
  const join = (...xs) => xs.filter(Boolean).join(" — ");

  const items = [];
  for (const p of snapshot.pending ?? []) {
    items.push({
      id: p.id,
      ts: ts(p.createdAt),
      speaker: "kimi",
      type: `pending · ${p.pendingType ?? "?"}`,
      conf: clamp5(p.priority),
      body: join(p.title, p.proposedAction || p.content),
    });
  }
  for (const s of snapshot.states ?? []) {
    items.push({
      id: s.id,
      ts: ts(s.startAt),
      speaker: "kimi",
      type: `state · ${s.stateType ?? "?"}`,
      conf: 4,
      body: join(s.title, s.summary || s.content),
    });
  }
  for (const m of snapshot.recentMemories ?? []) {
    items.push({
      id: m.id,
      ts: ts(m.createdAt),
      speaker: "you",
      type: `${m.memoryType ?? "MEMORY"}${m.isActive === false ? " · closed" : ""}`,
      conf: clamp5(m.importance),
      body: join(m.title, m.summary || m.content),
    });
  }
  return items.length ? { review: { items } } : {};
}
