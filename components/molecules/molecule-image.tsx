"use client";

type Props = { src?: string | null; alt: string; className?: string };
export function MoleculeImage({ src, alt, className }: Props) {
  const resolved = src?.startsWith("images/") && process.env.NEXT_PUBLIC_CDN_URL
    ? `${process.env.NEXT_PUBLIC_CDN_URL.replace(/\/$/, "")}/${src.split("/").map(encodeURIComponent).join("/")}`
    : src;
  // Molecule references may be SVG; the task requires plain img for these assets.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={resolved || "/molecule-fallback.svg"} alt={alt} className={className} loading="lazy" />;
}
