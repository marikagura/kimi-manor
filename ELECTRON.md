> English: ./ELECTRON.en.md

# cc-gild → 桌面 app（Electron）

> ⚠️ **未测试**：这套打包配置照着一份能跑通的设置写出来，但 `.dmg` / `.exe` 的成品**还没实际构建验证过**。
> 先 `npm run dist:mac` / `dist:win` 跑一次确认能出包；原生模块（`node-pty`）那步可能要按你的环境微调。
> web 壳（`node server.mjs` + 浏览器）和直接双击 `cc-gild-v7.html` 不受影响、一直能用。

Electron 壳是**附加**的：它起一个原生窗口，里面跑现有的 `server.mjs`，加载
`http://localhost:7681/atelier`。不改动 web 壳本身——出问题就在这一层修，不会回滚整个 app。

## 开发（原生窗口，系统 node）

```bash
npm install            # 装 electron + electron-builder
npm run electron:dev   # 用系统 node 起 server.mjs，开窗口
```

`electron:dev` 设了 `CCGILD_NODE=node`，子进程 server 跑在你的系统 node 上（开发最省事）。
窗口固定连 `127.0.0.1:7681`——origin 稳定，`localStorage`（面板位置 / 主题 / 对话）跨重启不丢。
端口被占（上次没退干净的自身 server，或 dev preview）就直接复用，不另起飘端口。

## 打包 .dmg / .exe

```bash
npm run dist:mac       # → dist/  里的 cc-gild-*.dmg   (macOS)
npm run dist:win       # → dist/  里的 cc-gild Setup *.exe   (Windows · nsis)
```

`dist:mac` 带了 `CSC_IDENTITY_AUTO_DISCOVERY=false`，跳过代码签名（出无签名包，本地 / 自用够了；
要分发给别人再单独配签名 / 公证）。

**App 图标**用 `build/icon.png`（描金狐狸，从 `public/icons/icon.svg` 烤的 1024px）——electron-builder
自动转成 mac 的 `.icns` 和 win 的 `.ico`，不用手动生成。换图标就替掉 `build/icon.png`（≥512px）。
（`npm run icons` 是另一回事，生成 PWA 用的 `public/icons/icon-*.png`，跟桌面 app 图标无关。）

## 唯一需要留意的：打包后的原生模块

`server.mjs` 只有一个原生依赖：**`node-pty`**（终端桥）。打包后子进程 server 经 Electron 的
node 模式（`ELECTRON_RUN_AS_NODE`）跑，所以 `node-pty` 要按 Electron 的 ABI 重建、并从 asar 解包
（`build.asar` 已设 `false`，整个 `node_modules` 不打进 asar，省去解包配置）：

```bash
npx @electron/rebuild -f -w node-pty
```

`node-pty` 是**可选**的——重建不了也没关系：终端会优雅降级（lazy / optional），atelier、实时状态、
Salon / Parlour 都照常。`.dmg` / `.exe` 一样能出。

## 改 app 名 / id

`package.json` 的 `build.appId`（`com.marikagura.ccgild`）和 `build.productName`（`cc-gild`）——
fork 的话改成你自己的。
