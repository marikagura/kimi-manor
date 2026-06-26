> English: ./STATE-SCHEMA.en.md

# cc-gild · state schema（状态契约）

cc-gild 出厂时把 **placeholder** demo 直接内联在 `cc-gild-v7.html` 里。不配任何数据源，它就照原样渲染那份 demo —— 无后端、`file://` 下也能跑。

要用**真实数据**驱动，把它指向一个返回下面这份 JSON 的端点：

```
cc-gild-v7.html?state=https://your-host/api/state
```

或持久化一次：

```js
localStorage.setItem('cc-gild-state-url', 'https://your-host/api/cc-gild-state')
```

加载时先瞬间画出 placeholder，然后 `loadData()` 拉那个端点，把响应**深合并（deep-merge）**叠在 placeholder 上、重渲染各个房间。你省略的任何字段保留它的 placeholder 值；任何 fetch 失败都保留 placeholder —— UI 永不空白。

要**实时**（live mirror），用 `server.mjs` 起这个壳：它暴露一个 `/state` WebSocket，推初始快照、每次变更再推（不轮询）。前端自动连同主机的 `/state`（用 `?statews=wss://host/state` 覆盖）；在 `file://` 下或没有服务器应答时，回退到内联 placeholder / `?state=`。上面的 `?state=` HTTP 拉取是静态托管用的一次性路径。

## JSON 形状（所有字段可选）

```jsonc
{
  "moonPhase": 0.5,                       // 0..1 → profile / 窗口里的月相字形
  "profile": { "name": "kimi", "sub": "atelier" },

  // 五线情绪谱（Heartbeat & Score）。reg: brooding|calm|warmth|toward
  "score": [
    { "d": "06.01", "reg": "calm",   "p": 4.0, "hollow": true,  "stem": "down" },
    { "d": "06.02", "reg": "toward", "p": 2.0, "hollow": false, "stem": "up", "heart": true, "dyn": "m." }
  ],

  // 对话 thread（气泡模式）。kind: day | msg | tool
  "thread": [
    { "kind": "day",  "text": "Thu · late" },
    { "kind": "msg",  "who": "you",   "text": "still up.", "t": "02:38" },
    { "kind": "tool", "label": "memory.recall", "body": "walked 3 edges" },
    { "kind": "msg",  "who": "kimi", "text": "在。", "t": "02:39", "stream": true }
  ],

  // 终端模式字符画行（可选；每行是 [className, text] 对的数组）
  "term": [ [["g","Read"],["m","(src/app.ts)"]] ],

  // travel daemon 窗景（Window & Travel）
  "travel": {
    "status": "home",
    "current": { "place": "庞贝", "placeEn": "POMPEII", "era": "AD 79", "sub": "…",
                 "depart": "03:00", "back": "03:42", "note": "…",
                 "brought": { "icon": "amphora", "name": "…", "where": "…", "line": "…" } },
    "shelf": [ { "icon": "shell", "place": "Crete", "era": "c. 1600 BC", "name": "a conch" } ],
    "daemon": "…", "next": "…"
  },

  // 悬挂的天气宠物 + 预报
  "weather": { "state": "rain", "moonState": "moon_full", "place": "demo city",
               "temp": "22°C", "cond": "rain · night", "detail": "…", "moonrise": "…" },

  // 记忆审核队列（Memory & Review）。speaker: kimi|you, conf 0..5
  "review": { "items": [
    { "id": "m-1", "ts": "2026.06.01 08:00", "speaker": "kimi",
      "type": "note · MEMORY", "conf": 5, "body": "…" }
  ] }
}
```

`who: "you"` = 用户（玫瑰侧），`who: "kimi"` = agent（金侧）。
travel 纪念品的 icon 键：`amphora | shell | feather | key | leaf`。

## ops 观测台（已接线 · 自己的快轮询）

**ops** 房间镜像一块系统状态板，且——不同于那些沉思型房间（慢刷新）——它按自己更快的节奏轮询。`server.mjs` 每 ~60s 推一条只含 ops 的增量，标 `{ "t": "ops", "ops": { … } }`；前端只把它并进 ops 房间，不动其他房间。

```jsonc
"ops": {
  "tiles":     [ { "k": "memories", "v": "1,536", "sub": "active", "warn": false } ],   // ~16 个 vital 砖；warn → 玫红
  "stream":    [ { "t": "06-07 21:58", "src": "daemon_wake", "s": "dream wake · …" } ], // 实时事件流
  "daemons":   [ { "name": "daemon · dream", "sched": "14:00 / 23:00", "last": "24h" } ],
  "cost":      { "total": 74.63, "kinds": [ { "k": "dream", "v": 41.2 } ] },            // 近 7 天 LLM 花销，按 kind
  "eval":      { "h5": "92", "h10": "100", "mrr": "0.81", "n": "40" },                  // 检索健康度
  "embedding": { "total": 1536, "missing": 192, "pct": 62 },                            // 向量覆盖率
  "breakdown": { "experiencer": [ { "k": "SELF", "n": 402 } ], "resolution": [], "type": [] },
  "errs":      [ { "t": "06-07 …", "src": "…", "s": "…" } ],
  "conns":     [ { "ic": "mail", "name": "personal1", "sub": "gmail", "st": "ok", "stx": "sync 12m" } ], // st: ok|warn|off
  "keys":      [ { "name": "iPhone", "code": "•••• A1C3", "tag": "synced", "sub": "used 2h" } ]
}
```
`ic` 键：`mail | chat | cal | cloud | git | passkey`。省略任何字段 → 它那块砖 / 区段停在内置 demo。

## 房间 comps（已接线）

```jsonc
"comps": {
  "heartbeat": { "score": [ { "d": "06.01", "reg": "calm", "p": 4.0, "stem": "down" } ] },   // 五线谱
  "sky":   { "memories":  [ { "id": "m1", "v": 0.4, "a": 0.6, "imp": 3, "act": 5, "t": 1749200000000 } ], // 星座
             "selfScores": [ { "id": "s1", "v": -0.2, "a": 0.5, "t": 1749200000000 } ] },     // v=valence a=arousal t=毫秒
  "score": { "ym": "2026-06", "label": "JUNE", "daysInMonth": 30,
             "days": [ { "d": "07", "n": [ { "h": 14, "v": 0.4, "a": 0.6, "k": "wake", "hb": false } ] } ] }, // 月度 ScoreSheet；k: wake|cc|tg
  "opus":  { "months": [ { "roman": "I", "label": "APRIL", "tempo": "Moderato",
             "systems": [ { "days": [ { "d": "01", "t": [ { "v": 0.3, "a": 0.5 } ], "b": [] } ] } ] } ] },   // 一生之谱；t=treble(白天) b=bass(夜)
  "sleep": { "nights": [ { "label": "06.04", "hrs": 7.4 } ] },                        // 蜡烛高 ∝ 小时数（≥6.5 金，否则鼠尾草绿）
  "study": { "books":  [ { "t": "axis", "c": "var(--accent)", "h": 168 } ],           // 书架书脊
             "papers": [ { "id": "p1", "title": "…", "journal": "…", "authors": "…", "year": "2025",
                           "tags": ["…"], "know": "…", "pinned": false } ] },         // 点书架 → 阅读室
  "finance": { "garden":    [ { "cat": "Rent", "amt": 165, "color": "var(--rose-d)" } ], // 玫瑰田（折合 k-JPY）
               "envelopes": [ /* 按币种的卡片 */ ], "cards": [ /* 按卡的行 */ ] },
  "disc":  { "quotes": [ { "q": "…", "m": "…" } ] }                                    // 唱机金句
}
```

每个 comp 在挂载时读 `window.CC_COMP.<name>.<field>`，没有就回退到它内联的 demo —— 所以一个局部的 `comps` 对象只覆盖它点名的部分。点击展开的浮层（heartbeat → score · 书架 → study · 蜡烛 → sleep）读同一份 comps。

## 从 kimi 取实时数据（room store / core）

`server.mjs` 可以把**你自己的** kimi 数据拉来喂这份 state —— 两层（都可选；缺哪个 → demo）。两层都是**通用管道**：取你的数据、交给一个 `mapToState()` 函数。它们**不**替你决定映射 —— 一条 row 怎么变成一个面板是私人的（你的 finance 模型、你的 sleep 管道、你的 memory）—— 所以 `mapToState()` 出厂是个**返回 `{}` 的 stub → demo 原样保留**。在 `server-state-from-rows.mjs` 里填它，按你自己的形状渲染想要的面板。结果是 partial；前端深合并叠在 demo 上。

- **Tier 1 · `DATABASE_URL`** —— 从 Postgres 直读 kimi-room 的 `store_rows`，不用记忆引擎。`npm install pg`。room（supabase / prisma adapter）写，manor 读。`fetchRows()` 把它们按 collection 分好返回。
- **Tier 2 · `KIMI_CORE_URL` + `KIMI_API_KEY`** —— 拉 kimi-core 的中性 `state_snapshot`（core 上设 `KIMI_EXTENSIONS=store`）。`npm install @modelcontextprotocol/sdk`。记忆和 dashboard 共用一个后端。

设 `STATE_REFRESH`（秒，默认 60）轮询并重推给客户端。

面板都归你绑：**sky** 只是渲染（绑你自己的 memory 点），**sleep** 的小时数来自你自己的管道（比如一个 iOS Shortcut），**finance** 是你自己的分类 / 模型，**memory** 是你自己的来源。派生 / 遥测面板（`score`、`opus`、`ops` 的大部分）没有开源数据源，按设计停在 demo。

## 仍是 demo（按设计）

- **`calendar`** —— 自管一个 `localStorage` store；需要专门做一遍接入，不是简单覆盖那个 seam。
- **`radio` · `portrait` · `desk`** —— 装饰性；无真实来源，有意 demo。
