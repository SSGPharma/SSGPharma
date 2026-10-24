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

export function MoleculesAlphaDirectory({ molecules, initialAlpha }: Props) {
  const [alpha, setAlpha] = useState<string | null>(initialAlpha ?? null);
  const [searchQuery, setSearchQuery] = useState("");

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => {
        const name = m.name.toLowerCase();
        const synonyms = (m.synonyms || "").toLowerCase();
        const overview = (m.overview || "").toLowerCase();
        if (name.includes(q) || synonyms.includes(q)) return true;
        let idx = 0;
        for (let i = 0; i < name.length && idx < q.length; i++) {
          if (name[i] === q[idx]) idx++;
        }
        if (idx === q.length) return true;
        idx = 0;
        for (let i = 0; i < synonyms.length && idx < q.length; i++) {
          if (synonyms[i] === q[idx]) idx++;
        }
        if (idx === q.length) return true;
        const words = q.split(/\s+/);
        return words.some((w) => overview.includes(w));
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [molecules, alpha, searchQuery]);

  const grouped = useMemo(() => {
    const g: Record<string, Molecule[]> = {};
    for (const m of filtered) {
      const k = m.name.trim()[0]?.toUpperCase() || "?";
      if (!g[k]) g[k] = [];
      g[k].push(m);
    }
    return g;
  }, [filtered]);

  const clear = () => {
    setAlpha(null);
    setSearchQuery("");
  };

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
                onClick={() => setAlpha(isActive ? null : (present ? l : alpha))}
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search molecules..."
            className="w-full rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60"
            aria-label="Search molecule directory"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {filtered.length} of {molecules.length} molecules
          {alpha ? ` · ${alpha}` : ""}
          {searchQuery ? ` · "${searchQuery}"` : ""}
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

      {/* Visual cards grouped by letter */}
      {filtered.length > 0 && (
        <div className="space-y-10">
          {Object.keys(grouped).sort((a, b) => a.localeCompare(b)).map((letter) => (
            <section key={letter} aria-labelledby={`heading-${letter}`}>
              <h2 id={`heading-${letter}`} className="mb-4 font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground">
                {letter}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {grouped[letter]?.map((molecule, index) => (
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
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
