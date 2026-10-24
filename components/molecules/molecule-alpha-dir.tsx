"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Molecule {
  id: string;
  name: string;
  slug: string;
}

export function MoleculeAlphaDir({ molecules }: { molecules: Molecule[] }) {
  const [alpha, setAlpha] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const letters = useMemo(() => {
    const set = new Set<string>();
    for (const m of molecules) {
      const c = m.name.trim()[0]?.toUpperCase();
      if (c && /[A-Z]/.test(c)) set.add(c);
    }
    return Array.from(set).sort();
  }, [molecules]);

  const filtered = useMemo(() => {
    let list = molecules;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (alpha) {
      list = list.filter((m) => m.name.trim()[0]?.toUpperCase() === alpha);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [molecules, alpha, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Molecule[]> = {};
    for (const m of filtered) {
      const k = m.name.trim()[0]?.toUpperCase() || "?";
      if (!g[k]) g[k] = [];
      g[k].push(m);
    }
    return g;
  }, [filtered]);

  const hasLetter = (l: string) => letters.includes(l);
  const activeLetter = alpha || (search.trim() ? null : null);

  const clear = () => { setAlpha(null); setSearch(""); };

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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search molecules..."
            className="w-full rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/60"
            aria-label="Search molecule directory"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
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
          {search ? ` · "${search}"` : ""}
        </div>
        {(alpha || search) && (
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

      {/* Grouped directory */}
      {filtered.length > 0 && (
        <div className="space-y-10">
          {Object.keys(grouped).sort((a, b) => a.localeCompare(b)).map((letter) => (
            <section key={letter} aria-labelledby={`heading-${letter}`}>
              <h2 id={`heading-${letter}`} className="mb-4 font-[family-name:var(--font-display)] text-3xl tracking-tight text-foreground">
                {letter}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[letter]?.map((m) => (
                  <Link
                    key={m.id}
                    href={`/molecules/${m.slug}`}
                    className="rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20"
                  >
                    <h3 className="font-medium text-foreground">{m.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">View profile →</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
