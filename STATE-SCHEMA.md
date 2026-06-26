# cc-gild · state schema

cc-gild ships with the **placeholder** demo inlined directly in `cc-gild-v7.html`. With no
data source configured it renders that demo as-is — no backend, works under `file://`.

To drive it with **real data**, point it at an endpoint that returns the JSON below:

```
cc-gild-v7.html?state=https://your-host/api/state
```

or persist it once:

```js
localStorage.setItem('cc-gild-state-url', 'https://your-host/api/cc-gild-state')
```

On load the placeholder paints first (instant), then `loadData()` fetches the endpoint
and **deep-merges** the response over the placeholder, re-rendering the rooms. Any field
you omit keeps its placeholder value. Any fetch failure keeps the placeholder — the UI
never goes blank.

For **real-time** (live mirror), serve the shell from `server.mjs`: it exposes a `/state`
WebSocket that pushes the initial snapshot and re-pushes on every change (no polling). The
front auto-connects to same-host `/state` (override with `?statews=wss://host/state`); under
`file://` or when no server answers it falls back to the inlined placeholder / `?state=`.
The `?state=` HTTP fetch above is the one-shot path for static hosting.

## JSON shape (all fields optional)

```jsonc
{
  "moonPhase": 0.5,                       // 0..1 → lunar glyph in profile / window
  "profile": { "name": "kimi", "sub": "atelier" },

  // five-line emotion stave (Heartbeat & Score). reg: brooding|calm|warmth|toward
  "score": [
    { "d": "06.01", "reg": "calm",   "p": 4.0, "hollow": true,  "stem": "down" },
    { "d": "06.02", "reg": "toward", "p": 2.0, "hollow": false, "stem": "up", "heart": true, "dyn": "m." }
  ],

  // conversation thread (bubble mode). kind: day | msg | tool
  "thread": [
    { "kind": "day",  "text": "Thu · late" },
    { "kind": "msg",  "who": "you",   "text": "still up.", "t": "02:38" },
    { "kind": "tool", "label": "memory.recall", "body": "walked 3 edges" },
    { "kind": "msg",  "who": "kimi", "text": "在。", "t": "02:39", "stream": true }
  ],

  // terminal mode char-art lines (optional; array of [className, text] pairs per line)
  "term": [ [["g","Read"],["m","(src/app.ts)"]] ],

  // travel daemon casement (Window & Travel)
  "travel": {
    "status": "home",
    "current": { "place": "庞贝", "placeEn": "POMPEII", "era": "AD 79", "sub": "…",
                 "depart": "03:00", "back": "03:42", "note": "…",
                 "brought": { "icon": "amphora", "name": "…", "where": "…", "line": "…" } },
    "shelf": [ { "icon": "shell", "place": "Crete", "era": "c. 1600 BC", "name": "a conch" } ],
    "daemon": "…", "next": "…"
  },

  // hanging weather pet + forecast
  "weather": { "state": "rain", "moonState": "moon_full", "place": "demo city",
               "temp": "22°C", "cond": "rain · night", "detail": "…", "moonrise": "…" },

  // memory curation queue (Memory & Review). speaker: kimi|you, conf 0..5
  "review": { "items": [
    { "id": "m-1", "ts": "2026.06.01 08:00", "speaker": "kimi",
      "type": "note · MEMORY", "conf": 5, "body": "…" }
  ] }
}
```

`who: "you"` = the user (rose side), `who: "kimi"` = the agent (gold side).
Icon keys for travel souvenirs: `amphora | shell | feather | key | leaf`.

## ops observatory (wired · its own fast poll)

The **ops** room mirrors a system status board, and — unlike the contemplative rooms
(slow refresh) — it polls on its own faster cadence. `server.mjs` pushes an ops-only delta
tagged `{ "t": "ops", "ops": { … } }` every ~60s; the front merges it into the ops room
only, leaving the other rooms untouched.

```jsonc
"ops": {
  "tiles":     [ { "k": "memories", "v": "1,536", "sub": "active", "warn": false } ],   // ~16 vital tiles; warn → rose
  "stream":    [ { "t": "06-07 21:58", "src": "daemon_wake", "s": "dream wake · …" } ], // live event log
  "daemons":   [ { "name": "daemon · dream", "sched": "14:00 / 23:00", "last": "24h" } ],
  "cost":      { "total": 74.63, "kinds": [ { "k": "dream", "v": 41.2 } ] },            // LLM spend 7d, by kind
  "eval":      { "h5": "92", "h10": "100", "mrr": "0.81", "n": "40" },                  // retrieval health
  "embedding": { "total": 1536, "missing": 192, "pct": 62 },                            // vector coverage
  "breakdown": { "experiencer": [ { "k": "SELF", "n": 402 } ], "resolution": [], "type": [] },
  "errs":      [ { "t": "06-07 …", "src": "…", "s": "…" } ],
  "conns":     [ { "ic": "mail", "name": "personal1", "sub": "gmail", "st": "ok", "stx": "sync 12m" } ], // st: ok|warn|off
  "keys":      [ { "name": "iPhone", "code": "•••• A1C3", "tag": "synced", "sub": "used 2h" } ]
}
```
`ic` keys: `mail | chat | cal | cloud | git | passkey`. Omit any field → its tile/section
stays on the built-in demo.

## room comps (wired)

```jsonc
"comps": {
  "heartbeat": { "score": [ { "d": "06.01", "reg": "calm", "p": 4.0, "stem": "down" } ] },   // five-line stave
  "sky":   { "memories":  [ { "id": "m1", "v": 0.4, "a": 0.6, "imp": 3, "act": 5, "t": 1749200000000 } ], // constellation
             "selfScores": [ { "id": "s1", "v": -0.2, "a": 0.5, "t": 1749200000000 } ] },     // v=valence a=arousal t=ms
  "score": { "ym": "2026-06", "label": "JUNE", "daysInMonth": 30,
             "days": [ { "d": "07", "n": [ { "h": 14, "v": 0.4, "a": 0.6, "k": "wake", "hb": false } ] } ] }, // monthly ScoreSheet; k: wake|cc|tg
  "opus":  { "months": [ { "roman": "I", "label": "APRIL", "tempo": "Moderato",
             "systems": [ { "days": [ { "d": "01", "t": [ { "v": 0.3, "a": 0.5 } ], "b": [] } ] } ] } ] },   // lifetime score; t=treble(day) b=bass(night)
  "sleep": { "nights": [ { "label": "06.04", "hrs": 7.4 } ] },                        // candle height ∝ hrs (≥6.5 gold, else sage)
  "study": { "books":  [ { "t": "axis", "c": "var(--accent)", "h": 168 } ],           // shelf spines
             "papers": [ { "id": "p1", "title": "…", "journal": "…", "authors": "…", "year": "2025",
                           "tags": ["…"], "know": "…", "pinned": false } ] },         // tap-shelf → reading room
  "finance": { "garden":    [ { "cat": "Rent", "amt": 165, "color": "var(--rose-d)" } ], // rose-garden (k-JPY-equiv)
               "envelopes": [ /* by-currency cards */ ], "cards": [ /* by-card rows */ ] },
  "disc":  { "quotes": [ { "q": "…", "m": "…" } ] }                                    // turntable 金句
}
```

Each comp reads `window.CC_COMP.<name>.<field>` at mount, falling back to its inlined demo —
so a partial `comps` object only overrides what it names. The tap-to-open overlays
(heartbeat → score · shelf → study · candle → sleep) read the same comps.

## Live from kimi (room store / core)

`server.mjs` can pull YOUR kimi data and feed this state — in two tiers (both
optional; either missing → the demo). Both are **generic plumbing**: they fetch your
data and hand it to a `mapToState()` function. They do NOT impose a mapping — how a
row becomes a panel is personal (your finance model, your sleep pipeline, your
memory) — so `mapToState()` ships as a **stub returning `{}` → the demo stays put**.
Fill it in (`server-state-from-rows.mjs`) to render the panels you want, in your own
shape. The result is partial; the front deep-merges it over the demo.

- **Tier 1 · `DATABASE_URL`** — read kimi-room's `store_rows` from Postgres, no
  memory engine. `npm install pg`. room (supabase / prisma adapter) writes; manor
  reads. `fetchRows()` returns them grouped by collection.
- **Tier 2 · `KIMI_CORE_URL` + `KIMI_API_KEY`** — pull kimi-core's neutral
  `state_snapshot` (with `KIMI_EXTENSIONS=store`). `npm install
  @modelcontextprotocol/sdk`. Memory and dashboard share one backend.

Set `STATE_REFRESH` (seconds, default 60) to poll and re-push to clients.

The panels are yours to bind: **sky** is a render (bind your own memory points),
**sleep** takes hours from your own pipeline (e.g. an iOS Shortcut), **finance** is
your own categories/model, **memory** is your own source. The derived / telemetry
panels (`score`, `opus`, most of `ops`) have no open source and stay demo by design.

## Still demo (by design)

- **`calendar`** — manages its own `localStorage` store; needs a dedicated integration
  pass, not the simple override seam.
- **`radio` · `portrait` · `desk`** — decorative; no real source, intentionally demo.
