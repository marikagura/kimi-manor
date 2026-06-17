// v2-data.js — demo content. Generic only — no private data.
// Only REVIEW.items is consumed by the v4 shell (记忆审核 cards).
(function (root) {

  // memory curation queue (demo) — speaker: kimi (agent) | you (user)
  const REVIEW = {
    pending: 6,
    items: [
      { id:'m-1', ts:'2026.05.26 08:00', speaker:'kimi', type:'note · MEMORY', exp:'SELF', conf:5,
        body:'Sample curation card — the agent proposes a memory; you approve, edit, or reject. Placeholder copy, no real content.' },
      { id:'m-2', ts:'2026.05.26 08:00', speaker:'you', type:'note · BOUNDARY', exp:'USER', conf:4,
        body:'Second sample card. Confidence shows as seed-buds; the gold rings approve or dismiss. Demo text only.' },
      { id:'m-3', ts:'2026.05.25 23:14', speaker:'kimi', type:'note · CORE', exp:'SELF', conf:5,
        body:'Third sample card — placeholder.' },
    ],
  };

  // unused by the v4 shell — kept as empty stubs so imports never break.
  const OPS = { tiles: [], caption: '', health: [], evalLatest: '', eval7d: [] };
  const CAL = { year: 2026, month: 5, label: 'May', cn: '', startDow: 5, days: 31, marks: {}, today: 1, agenda: [] };
  const STUDY = { books: [], shelfNote: '', rows: [] };
  const ROOMS = [];
  const ANNOS = [];

  root.V2 = { REVIEW, OPS, CAL, STUDY, ROOMS, ANNOS };
})(window);
