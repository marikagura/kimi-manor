> 中文（原文）: ./ELECTRON.md

# cc-gild → desktop app (Electron)

> ⚠️ **Untested**: this packaging config is written from a setup known to work, but the
> `.dmg` / `.exe` artifacts have **not been build-verified yet**. Run `npm run dist:mac` /
> `dist:win` once to confirm a package comes out; the native-module (`node-pty`) step may need
> tweaking for your environment. The web shell (`node server.mjs` + a browser) and
> double-clicking `cc-gild-v7.html` are unaffected and always work.

The Electron shell is **additive**: it opens a native window that runs the existing
`server.mjs` inside and loads `http://localhost:7681/atelier`. It doesn't change the web shell
itself — fix problems in this layer without rolling back the whole app.

## Dev (native window, system node)

```bash
npm install            # installs electron + electron-builder
npm run electron:dev   # starts server.mjs on system node, opens the window
```

`electron:dev` sets `CCGILD_NODE=node`, so the child server process runs on your system node
(simplest for development). The window always connects to `127.0.0.1:7681` — a stable origin,
so `localStorage` (panel layout / theme / chats) survives restarts. If the port is taken (a
previous self-server that didn't exit cleanly, or a dev preview) it reuses it rather than
drifting to another port.

## Package .dmg / .exe

```bash
npm run dist:mac       # → cc-gild-*.dmg in dist/        (macOS)
npm run dist:win       # → cc-gild Setup *.exe in dist/  (Windows · nsis)
```

`dist:mac` carries `CSC_IDENTITY_AUTO_DISCOVERY=false`, skipping code signing (an unsigned
package — fine for local / personal use; configure signing / notarization separately to
distribute to others).

The **app icon** uses `build/icon.png` (the gilt fox, baked to 1024px from
`public/icons/icon.svg`) — electron-builder converts it to mac's `.icns` and win's `.ico`
automatically, no manual generation. To change the icon, replace `build/icon.png` (≥512px).
(`npm run icons` is a different thing — it generates the PWA's `public/icons/icon-*.png`,
unrelated to the desktop app icon.)

## The one thing to watch: native modules after packaging

`server.mjs` has a single native dependency: **`node-pty`** (the terminal bridge). After
packaging, the child server process runs through Electron's node mode
(`ELECTRON_RUN_AS_NODE`), so `node-pty` must be rebuilt for Electron's ABI and unpacked from
the asar (`build.asar` is set to `false`, so the whole `node_modules` is not packed into the
asar, sparing you the unpack config):

```bash
npx @electron/rebuild -f -w node-pty
```

`node-pty` is **optional** — if it can't rebuild, no problem: the terminal degrades gracefully
(lazy / optional), and atelier, live state, and Salon / Parlour all keep working. The `.dmg` /
`.exe` still comes out.

## Change app name / id

`package.json`'s `build.appId` (`com.marikagura.ccgild`) and `build.productName` (`cc-gild`) —
change them to your own if you fork.
