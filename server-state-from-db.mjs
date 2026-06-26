// Tier 1 (no core) — read kimi-room's store_rows straight from Postgres. This is
// generic plumbing only: it hands back your rows grouped by collection; what they
// MEAN (which panel, which shape) is yours to decide in mapToState()
// (server-state-from-rows.mjs). room (supabase / prisma adapter) writes the table;
// manor reads it — one shared DB, no memory engine.
//
// `pg` is an OPTIONAL dependency: `npm install pg`. If absent or the DB is
// unreachable, composeState() catches and falls back to the placeholder.

import { groupRows } from "./server-state-from-rows.mjs";

export async function fetchRows(databaseUrl) {
  const pg = (await import("pg")).default; // pg is CJS → namespace on default
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const { rows } = await client.query(
      "SELECT id, collection, data, created_at, updated_at FROM store_rows",
    );
    return groupRows(rows);
  } finally {
    await client.end().catch(() => {});
  }
}
