// /go?p=<shop>/<item>&s=<slug>&ch=<channel> : count the click (KV binding CLICKS, optional) and redirect to the
// Shopee affiliate link with sub_id=<channel>-<slug>. Without the KV binding it only redirects.
const AFF = "15342160279";
const CH = { ig: "instagram", yt: "youtube", fb: "facebook" };
const clean = (v, n) => (v || "").replace(/[^a-z0-9-]/gi, "").slice(0, n);

export async function onRequestGet({ request, env, waitUntil }) {
  const u = new URL(request.url);
  const p = (u.searchParams.get("p") || "").match(/^(\d{1,15})\/(\d{1,15})$/);
  const slug = clean(u.searchParams.get("s"), 40);
  const ch0 = clean(u.searchParams.get("ch"), 12).toLowerCase() || "hub";
  const ch = CH[ch0] || ch0;
  if (!p) return Response.redirect("https://saruphai.pages.dev/", 302);
  const origin = `https://shopee.co.th/product/${p[1]}/${p[2]}`;
  const dest = `https://s.shopee.co.th/an_redir?origin_link=${encodeURIComponent(origin)}&affiliate_id=${AFF}&sub_id=${ch}-${slug.replace(/-/g, "")}`;
  if (env.CLICKS) {
    const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); // Thailand date
    const key = `c|${day}|${ch}|${slug}`;
    waitUntil((async () => {
      const n = parseInt((await env.CLICKS.get(key)) || "0", 10);
      await env.CLICKS.put(key, String(n + 1), { expirationTtl: 400 * 86400 });
    })());
  }
  return Response.redirect(dest, 302);
}
