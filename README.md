# kimi-manor 

把 Claude Code——或任何一个 agent CLI——请进一间房子。

不是又一块黑屏终端，是一座四室 atelier（**atelier · alcove · cabinet · ops**），桌面裹着一个真实终端。你的命令行在这间屋子里跑。

> 出厂即 placeholder 数据、离线可跑。接上你自己的端点，它就活成实时的。

`server.mjs` 另带几条可选 **live bridge**——终端跑任何 agent CLI（`CC_CMD` 换：claude · codex · gemini · aider…），Salon 气泡里 Claude 与 codex 两座同席，Parlour 把它们念出声。每条都门控在你自己的 key 后面、默认不联网，UI 从不假设一个它渲染不了的后端。

## 单文件构建

`cc-gild-v7.html` 是当前的单文件 atelier——完全自包含（CSS / JS 内联，几张 PNG 放 `assets/`），
四室 · **atelier · alcove · cabinet · ops**。直接打开，或起服务。

## 运行

```bash
npm install

# 静态预览 atelier（placeholder 数据，离线可跑）
node serve.mjs                  # → http://localhost:8753

# 全功能壳 — 终端 PTY + /state + Salon / Parlour bridge
node server.mjs                 # → http://localhost:7681/atelier
#   CC_CWD=/path CC_CMD=claude        # 工作目录 / 启动命令
```

`cc-gild-v7.html` 自包含——也可以直接双击打开。

## 桌面 app（可选）

也能包成原生桌面 app：`npm run electron:dev` 开窗口，`npm run dist:mac` / `npm run dist:win`
出 `.dmg` / `.exe`。Electron 壳是附加层（起 `server.mjs` + 原生窗口），web 壳照旧能用。
**注意：打包配置已写好，但 `.dmg` / `.exe` 成品还没实际构建验证过**——细节、原生模块（`node-pty`）
重建、签名都在 [ELECTRON.md](ELECTRON.md)。

## Live bridges（可选）

`server.mjs` 只绑 `127.0.0.1`，开四条 bridge；任一缺工具或 key 就静默降级，所以一条都不配也照样跑。

| bridge | 是什么 | 需要 |
|---|---|---|
| `/pty` | 真终端——**任何 agent CLI 或 shell**（claude · codex · gemini · aider…，`CC_CMD` 换） | `node-pty`（optional dep）· `SHELL_FALLBACK=1` 起普通 shell |
| `/agent` | Salon 的 **Claude** 座（气泡对话，工具调用在 UI 里批准） | `@anthropic-ai/claude-agent-sdk` + 你的 `claude` 登录 · `CCG_SDK` / `CCG_AGENT_CWD` / `CCG_CWD_ALLOW` 覆盖 |
| `/codex` | Salon 的 **codex** 座（`codex exec` 协议，只读 · shell 关） | PATH 上有 `codex`（或 codex 兼容 CLI）· `CODEX_BIN` 覆盖 |
| `/parlour/voice` | Parlour 的 text-to-speech | `OPENAI_API_KEY`（或 `CCG_TTS_URL` + `CCG_TTS_KEY` 接任何 OpenAI 兼容 TTS）· `CCG_VOICE_CLAUDE` / `CCG_VOICE_GPT` / `CCG_TTS_MODEL` |

**Parlour 默认是文字、不带声音。** 回复以文字呈现；要出声，把 `/parlour/voice` 指向你自己的 TTS——
设 `OPENAI_API_KEY`，或用 `CCG_TTS_URL` + `CCG_TTS_KEY` 接任何 OpenAI 兼容端点。什么都不设就保持安静、
只显示文字。也不带翻译，字幕就是朗读的原文。

**天气**开箱即活——`server.mjs` 从 [open-meteo](https://open-meteo.com) 拉当前天况（免 key），
默认中央东京。设 `CCG_WEATHER_LAT` / `CCG_WEATHER_LNG` / `CCG_WEATHER_PLACE` 换成你自己的天空，
或 `CCG_WEATHER=off` 留 demo 天气。

## 真数据

壳先画 placeholder，再把真数据叠上去；任何 fetch 失败都保留 placeholder，所以 UI 永不空白。两条路：

```
# 一次性 HTTP（静态托管）— 返回 state schema
cc-gild-v7.html?state=https://your-host/api/state

# 实时镜像 — server 经 /state WebSocket 推，变更即重推（不轮询）
node server.mjs   → 打开 /atelier
```

本地对着 demo state 试：

```
http://localhost:8753/cc-gild-v7.html?state=./state.sample.json
```

契约——顶层 key（`score` · `review` · `ops` · `travel` · `weather`）和每室的 `comps`
（`heartbeat` · `sky` · `score` · `study` · `sleep` · `opus` · `finance` · `disc`），加上哪些室接了线、
**ops** 室怎么按自己更快的节奏轮询：见 [STATE-SCHEMA.md](STATE-SCHEMA.md)。你端点省略的 `comps` / `ops`
就停在内置 demo，所以只给一部分也行。

## 元素

- 全手绘金线 SVG
- Cormorant Garamond 配宋体
- 烛光的夜 / 玫瑰田的昼，选择存 localStorage

## 目录

```
cc-gild-v7.html    单文件 atelier（当前产物）
serve.mjs          静态预览 server → cc-gild-v7.html
server.mjs         终端壳 + /state WebSocket 参考 server
state.sample.json  ?state= 的 demo 数据
STATE-SCHEMA.md    真数据契约（顶层 + comps + ops）
assets/            运行时 SVG（pilaster · rose-panel）+ 设计源（PNG & 组件）
public/            终端壳 PWA（index.html · boot.js · sw.js）
electron/          原生窗口 main + preload（npm run electron:dev / dist:*）
ELECTRON.md        打包成 .dmg / .exe 的说明（未测试）
```

## License

代码：[MIT](LICENSE) © 2026 marikagura。壳随便 fork。

艺术**不**走 MIT，分两层：

- `assets/entry-motion.png`（入场动画 · 庄园的门脸）—— © 2026 marikagura，保留所有权利。
- 其余手绘金线 SVG / PNG——烛台、狐狸、玫瑰、书架、印记，以及描金那套——按
  [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)：署名 + 非商业前提下随便用、
  随便改；别商用，也别把素材单独拎出来再分发。署名一句
  `art & UI based on kimi-manor by marikagura` + 仓库链接即可。
