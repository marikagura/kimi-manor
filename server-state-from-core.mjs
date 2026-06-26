// Tier 2 (core) — pull kimi-core's neutral state_snapshot over MCP. Generic
// plumbing only: it returns the snapshot as-is; you decide what to render in
// mapToState() (server-state-from-rows.mjs). The same kimi-core that serves memory
// also serves this, so manor and kimi-room can share one engine.
//
// `@modelcontextprotocol/sdk` is an OPTIONAL dependency: `npm install
// @modelcontextprotocol/sdk`. If absent or core is unreachable, composeState()
// catches and falls back. Needs the store extension on kimi-core (KIMI_EXTENSIONS=store).

// Call core's state_snapshot tool over Streamable-HTTP MCP (Bearer auth), the same
// transport kimi-room's /api/core uses. Returns the parsed neutral snapshot JSON.
export async function fetchSnapshot(coreUrl, apiKey) {
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { StreamableHTTPClientTransport } = await import(
    "@modelcontextprotocol/sdk/client/streamableHttp.js"
  );
  const url = new URL(`${coreUrl.replace(/\/$/, "")}/mcp`);
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: { headers: { Authorization: `Bearer ${apiKey}` } },
  });
  const client = new Client({ name: "kimi-manor", version: "0.1.0" });
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: "state_snapshot", arguments: {} });
    const text = (result?.content ?? [])
      .filter((c) => c?.type === "text" && typeof c.text === "string")
      .map((c) => c.text)
      .join("\n");
    return JSON.parse(text);
  } finally {
    await client.close().catch(() => {});
  }
}
