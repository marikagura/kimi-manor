# kimi-manor · 描金

A gilt web shell for Claude Code — a dark Art-Nouveau / Mucha desktop that wraps a real
terminal and a four-room atelier (**atelier · alcove · cabinet · ops**). Hand-drawn gold
hairline SVG, Cormorant Garamond + 宋体, night / day skins. No icon fonts, no charts where
a metaphor will do. (codename `cc-gild`.)

Everything here ships with **placeholder data** and works offline. Point it at your own
endpoint to drive it live (see [Real data](#real-data)). The bundled `server.mjs` adds
optional **live bridges** — a real terminal, the **Salon** (Claude + GPT seats) and
**Parlour** voice — each gated behind your own keys; nothing phones home by default, and
the UI never assumes a schema (or a backend) it can't render.

## The build

`cc-gild-v7.html` is the current single-file atelier — fully self-contained (CSS / JS
inlined; a few PNGs under `assets/`), four rooms · **atelier · alcove · cabinet · ops**.
Open it directly or serve it.

## Run

```bash
npm install

# static preview of the atelier (placeholder data, works offline)
node serve.mjs                  # → http://localhost:8753  (serves cc-gild-v7.html)

# full shell — terminal PTY + /state + the Salon / Parlour bridges
node server.mjs                 # → http://localhost:7681/atelier
#   CC_CWD=/path CC_CMD=claude        # working dir / launch command
```

`cc-gild-v7.html` is self-contained — you can also just double-click it.

## Live bridges (optional)

`server.mjs` binds `127.0.0.1` only and exposes four bridges; each degrades to quiet if
its tool or key is absent, so the shell runs fine with none of them configured.

| bridge | what | needs |
|---|---|---|
| `/pty` | a real Claude Code / shell terminal | `node-pty` (optional dep) · `SHELL_FALLBACK=1` for a plain shell |
| `/agent` | the Salon's **Claude** seat (bubble chat, tool calls approved in-UI) | `@anthropic-ai/claude-agent-sdk` + your `claude` login · `CCG_SDK` / `CCG_AGENT_CWD` / `CCG_CWD_ALLOW` to override |
| `/codex` | the Salon's **GPT** seat (read-only, shell off) | `codex` on PATH · `CODEX_BIN` to override |
| `/parlour/voice` | text-to-speech for the Parlour | `OPENAI_API_KEY` (or `CCG_TTS_URL` + `CCG_TTS_KEY` for any OpenAI-compatible TTS) · `CCG_VOICE_CLAUDE` / `CCG_VOICE_GPT` / `CCG_TTS_MODEL` |

**The Parlour is text by default — it ships with no voice.** Replies render as text;
to hear them, point `/parlour/voice` at your own TTS — set `OPENAI_API_KEY`, or
`CCG_TTS_URL` + `CCG_TTS_KEY` for any OpenAI-compatible endpoint. With nothing set the
room stays silent and just shows the text. Translation isn't bundled either, so the
caption is the spoken text as-is.

**Weather** is live out of the box — `server.mjs` pulls current conditions from
[open-meteo](https://open-meteo.com) (keyless), defaulting to central Tokyo. Set
`CCG_WEATHER_LAT` / `CCG_WEATHER_LNG` / `CCG_WEATHER_PLACE` for your own sky, or
`CCG_WEATHER=off` to keep the demo weather.

## Real data

The shell paints placeholder state first, then merges real data over it; any fetch
failure keeps the placeholder, so the UI never blanks. Two paths:

```
# one-shot HTTP (static hosting) — returns the state schema
cc-gild-v7.html?state=https://your-host/api/state

# live mirror — server pushes over a /state WebSocket, re-pushes on change (no polling)
node server.mjs   → open /atelier
```

Try it locally against the demo state:

```
http://localhost:8753/cc-gild-v7.html?state=./state.sample.json
```

The contract — top-level keys (`score` · `review` · `ops` · `travel` · `weather`) and the
per-room `comps` (`heartbeat` · `sky` · `score` · `study` · `sleep` · `opus` · `finance` ·
`disc`) — plus which rooms are wired and how the **ops** room polls on its own faster
cadence: [STATE-SCHEMA.md](STATE-SCHEMA.md). The `comps`/`ops` your endpoint omits simply
stay on their built-in demo, so a partial endpoint is fine.

## Theme

Night (default · candlelit gold-on-warmblack) / day (rose field with gilt linework).
Toggle in the top-right; choice persists in `localStorage`.

## Layout

```
cc-gild-v7.html    the single-file atelier (current artifact)
serve.mjs          static preview server → cc-gild-v7.html
server.mjs         terminal-shell + /state WebSocket reference server
state.sample.json  demo state for ?state=
STATE-SCHEMA.md    real-data contract (top-level + comps + ops)
assets/            runtime SVGs (pilaster · rose-panel) + design-source PNGs & components
public/            terminal-shell PWA (index.html · boot.js · sw.js)
```

## License

Code: [MIT](LICENSE) © 2026 marikagura.

Artwork is **not** MIT. The hand-drawn gold-hairline SVG/PNG illustrations — the candle,
fox, roses, bookshelf, sigil and the rest of the 描金 set — are © 2026 marikagura, all
rights reserved (reuse for your own project by permission). Fork the shell freely; draw
your own line.
