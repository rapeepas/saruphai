// /stats?since=YYYY-MM-DD : hub click counts as rows {date, channel, slug, clicks}. Counts only, no visitor data.
export async function onRequestGet({ request, env }) {
  if (!env.CLICKS) return Response.json({ ok: false, error: "KV binding CLICKS is not set up yet", rows: [] });
  const since = new URL(request.url).searchParams.get("since") || "2000-01-01";
  const rows = [];
  let cursor;
  do {
    const page = await env.CLICKS.list({ prefix: "c|", cursor });
    for (const k of page.keys) {
      const [, date, channel, slug] = k.name.split("|");
      if (date < since) continue;
      rows.push({ date, channel, slug, clicks: parseInt((await env.CLICKS.get(k.name)) || "0", 10) });
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);
  return Response.json({ ok: true, rows }, { headers: { "cache-control": "no-store" } });
}
