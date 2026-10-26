/** Canonical site origin for metadata, sitemap, and JSON-LD. No trailing slash. */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const candidate = raw
    ? /^https?:\/\//i.test(raw)
      ? raw
      : `https://${raw}`
    : "http://localhost:3000";

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}
