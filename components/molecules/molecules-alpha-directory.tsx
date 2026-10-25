"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { ManagedImage } from "@/components/web/managed-image";
import { marketingImages } from "@/lib/marketing-images";
import { summarizeText } from "@/lib/content-parsers";
import { cn } from "@/lib/utils";

interface Molecule {
  id: string;
  name: string;
  slug: string;
  synonyms?: string | null;
  imageUrl?: string | null;
  overview?: string | null;
}

interface Props {
  molecules: Molecule[];
  initialAlpha?: string | null;
}

const PAGE_SIZE = 10;

export function MoleculesAlphaDirectory({ molecules, initialAlpha }: Props) {
  const [alpha, setAlpha] = useState<string | null>(initialAlpha ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const letters = useMemo(() => {
    const set = new Set<string>();
    for (const m of molecules) {
      const c = m.name.trim()[0]?.toUpperCase();
      if (c && /[A-Z]/.test(c)) set.add(c);
    }
    return Array.from(set).sort();
  }, [molecules]);

  const hasLetter = (l: string) => letters.includes(l);

  const filtered = useMemo(() => {
    let list = molecules;
    if (alpha) {
      list = list.filter((m) => m.name.trim()[0]?.toUpperCase() === alpha);
    }
    const q = searchQuery.trim();
    if (q) {
      const lowerQ = q.toLowerCase();
      list = list.filter((m) => {
        const name = m.name.toLowerCase();
        return name.startsWith(lowerQ);
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [molecules, alpha, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const clear = () => {
    setAlpha(null);
    setSearchQuery("");
    setPage(1);
  };

  const handleAlpha = (l: string | null) => {
    setAlpha(l);
    setPage(1);
  };

  const resultStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const resultEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <section aria-label="A-Z Molecules Directory" className="space-y-8">
      {/* A-Z selector */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select letter">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => {
            const present = hasLetter(l);
            const isActive = alpha === l;
            return (
              <button
                key={l}
                role="tab"
                aria-selected={isActive}
                aria-label={`Letter ${l}${present ? "" : ", no molecules"}`}
                onClick={() => {
              const next = isActive ? null : (present ? l : alpha);
              handleAlpha(next);
            }}
                disabled={!present && !isActive}
                className={cn(
                  "min-w-[2.25rem] rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : present
                    ? "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                    : "border-border/40 bg-muted/40 text-muted-foreground cursor-default",
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + count */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[16rem]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search molecules..."
            className="w-full rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60"
            aria-label="Search molecule directory"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filtered.length > 0 ? `${resultStart}-${resultEnd} of ${filtered.length}` : "0"} molecules
          {alpha ? ` · ${alpha}` : ""}
          {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : ""}
        </div>
        {(alpha || searchQuery) && (
          <button onClick={clear} className="text-sm font-medium text-primary hover:underline" aria-label="Reset filters">
            Show all
          </button>
        )}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <p className="text-muted-foreground">No molecules match your selection.</p>
          <button onClick={clear} className="mt-3 text-sm font-medium text-primary hover:underline">Clear and show all</button>
        </div>
      )}

      {/* Cards — paginated, flat grid (no letter grouping) */}
      {filtered.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((molecule, index) => (
              <FadeIn key={molecule.id} delay={Math.min(index * 0.03, 0.18)}>
                <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-white">
                    <ManagedImage
                      src={molecule.imageUrl || marketingImages.microscope}
                      alt={`${molecule.name} molecule page image`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <h3 className="font-(family-name:--font-display) text-2xl text-foreground">
                        {molecule.name}
                      </h3>
                      {molecule.synonyms ? (
                        <p className="mt-2 text-sm text-muted-foreground">{molecule.synonyms}</p>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {summarizeText(molecule.overview, 150) ||
                        `${molecule.name} molecule profile covering overview, uses, and safety notes.`}
                    </p>
                    <Link
                      href={`/molecules/${molecule.slug}`}
                      className="inline-flex text-sm font-medium text-primary hover:underline"
                    >
                      View molecule page
                    </Link>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
                  currentPage <= 1
                    ? "border-border/40 bg-muted/40 text-muted-foreground cursor-default"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
                )}
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-label={`Page ${p}`}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={cn(
                      "min-w-[2.25rem] rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
                      p === currentPage
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
                  currentPage >= totalPages
                    ? "border-border/40 bg-muted/40 text-muted-foreground cursor-default"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
                )}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
