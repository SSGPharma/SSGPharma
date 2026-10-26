import "server-only";
import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { isIP } from "node:net";
import { MAX_IMAGE_BYTES, putImage, sniffImage } from "@/lib/image-storage";

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const octets = ip.split(".").map(Number);
    const a = octets[0] ?? 0, b = octets[1] ?? 0, c = octets[2] ?? 0;
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0 || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113);
  }
  // Reject IPv6 entirely: canonical and mapped forms are easy to misclassify,
  // and external image links do not need access to IPv6-only origins.
  return true;
}

async function fetchPinned(url: URL, address: string, family: number): Promise<{ status: number; location: string | null; type: string | null; body: Buffer }> {
  const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
  return new Promise((resolve, reject) => {
    const req = transport(url, { method: "GET", timeout: 5000, headers: { "User-Agent": "SSGPharma-image-mirror/1.0", Accept: "image/png,image/jpeg,image/webp" }, lookup: (_hostname, _options, callback) => callback(null, address, family) }, (res) => {
      const chunks: Buffer[] = []; let size = 0; let tooLarge = false;
      res.on("data", (chunk: Buffer) => { size += chunk.length; if (size > MAX_IMAGE_BYTES) { tooLarge = true; req.destroy(new Error("Image exceeds the 2 MB limit")); } else chunks.push(chunk); });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, location: res.headers.location ?? null, type: res.headers["content-type"]?.split(";")[0]?.trim().toLowerCase() ?? null, body: Buffer.concat(chunks) }));
      res.on("error", reject);
      if (tooLarge) reject(new Error("Image exceeds the 2 MB limit"));
    });
    req.on("timeout", () => req.destroy(new Error("Image fetch timed out")));
    req.on("error", reject); req.end();
  });
}

export async function mirrorExternalImage(input: string): Promise<string> {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error("Molecule image must be a valid HTTP(S) URL"); }
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP(S) molecule image links are allowed");
    if (url.username || url.password || url.port && !["80", "443"].includes(url.port)) throw new Error("Molecule image URL is not allowed");
    const records = isIP(url.hostname) ? [{ address: url.hostname, family: isIP(url.hostname) }] : await lookup(url.hostname, { all: true, verbatim: true });
    if (!records.length || records.some((record) => isPrivateIp(record.address))) throw new Error("Molecule image host resolves to a restricted address");
    const firstRecord = records[0];
    if (!firstRecord) throw new Error("Molecule image host did not resolve");
    const response = await fetchPinned(url, firstRecord.address, firstRecord.family);
    if ([301,302,303,307,308].includes(response.status) && response.location) {
      if (redirects === 3) throw new Error("Too many redirects while fetching molecule image");
      url = new URL(response.location, url); continue;
    }
    if (response.status < 200 || response.status >= 300) throw new Error("Molecule image host returned an error");
    const mime = sniffImage(response.body);
    if (!mime || response.type !== mime) throw new Error("Molecule link must point to a PNG, JPEG, or WebP image");
    return putImage(response.body, mime);
  }
  throw new Error("Could not fetch molecule image");
}
