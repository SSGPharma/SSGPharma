import type { MetadataRoute } from "next";
import { productDivisions, serviceLines } from "@/lib/divisions";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about-us",
    "/products",
    "/services",
    "/contact-us",
    "/get-a-quote",
    "/molecules",
    "/patient-assistance-programs",
    "/privacy-policy",
    "/terms-and-conditions",
    "/disclaimer",
    "/return-policy",
    "/shipping-policy",
    ...productDivisions.map((d) => `/divisions/${d.slug}`),
    ...serviceLines.map((s) => s.href),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority:
      path === ""
        ? 1
        : path.startsWith("/products") || path.startsWith("/divisions")
          ? 0.9
          : 0.7,
  }));

  let medicineRoutes: MetadataRoute.Sitemap = [];
  let moleculeRoutes: MetadataRoute.Sitemap = [];
  try {
    const meds = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
      take: 1000,
    });
    medicineRoutes = meds.map((m) => ({
      url: `${base}/products/${m.slug}`,
      lastModified: m.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    const molecules = await prisma.molecule.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      take: 1000,
    });

    moleculeRoutes = molecules.map((molecule) => ({
      url: `${base}/molecules/${molecule.slug}`,
      lastModified: molecule.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.82,
    }));
  } catch {
    // DB missing in CI / edge cases — still ship static URLs
  }

  return [...staticRoutes, ...medicineRoutes, ...moleculeRoutes];
}
