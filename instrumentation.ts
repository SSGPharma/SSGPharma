export async function register() {
  if (process.env.NODE_ENV !== "production") return;
  const errors: string[] = [];
  const secret = (process.env.ADMIN_SESSION_SECRET ?? process.env.SESSION_SECRET ?? "").trim();
  if (!secret) errors.push("ADMIN_SESSION_SECRET (or legacy SESSION_SECRET) is required");
  else if (secret.length < 32) errors.push("ADMIN_SESSION_SECRET must be at least 32 characters");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  try {
    const parsed = new URL(siteUrl);
    if (!/^https?:$/.test(parsed.protocol)) errors.push("NEXT_PUBLIC_SITE_URL must use http or https");
  } catch { errors.push("NEXT_PUBLIC_SITE_URL is required and must be an absolute URL"); }
  if (errors.length) throw new Error(`Invalid production environment:\n- ${errors.join("\n- ")}`);
}
