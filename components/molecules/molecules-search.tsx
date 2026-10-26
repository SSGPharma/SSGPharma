"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { MoleculeImage } from "@/components/molecules/molecule-image";
import { marketingImages } from "@/lib/marketing-images";
import { summarizeText } from "@/lib/content-parsers";
import { Search } from "lucide-react";

interface Molecule {
  id: string;
  name: string;
  slug: string;
  synonyms?: string | null;
  imageUrl?: string | null;
  overview?: string | null;
}

interface MoleculesSearchProps {
  molecules: Molecule[];
  moleculeCount: number;
  alpha?: string | null;
}

export function MoleculesSearch({ molecules, moleculeCount, alpha }: MoleculesSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Apply both search and letter filter to the full catalog
  const preFiltered = useMemo(() => {
    let list = molecules;
    if (alpha) {
      list = list.filter((m) => m.name.trim()[0]?.toUpperCase() === alpha);
    }
    return list;
  }, [molecules, alpha]);

  // Simple fuzzy search implementation
  const filteredMolecules = useMemo(() => {
    if (!searchQuery.trim()) return preFiltered;

    const query = searchQuery.toLowerCase();

    return preFiltered.filter((molecule) => {
      const name = molecule.name.toLowerCase();
      const synonyms = (molecule.synonyms || "").toLowerCase();
      const overview = (molecule.overview || "").toLowerCase();

      // Direct match (highest priority)
      if (name.includes(query) || synonyms.includes(query)) {
        return true;
      }

      // Fuzzy matching: check if all characters appear in order
      let queryIndex = 0;
      for (let i = 0; i < name.length && queryIndex < query.length; i++) {
        if (name[i] === query[queryIndex]) {
          queryIndex++;
        }
      }
      if (queryIndex === query.length) return true;

      // Check synonyms for fuzzy match
      queryIndex = 0;
      for (let i = 0; i < synonyms.length && queryIndex < query.length; i++) {
        if (synonyms[i] === query[queryIndex]) {
          queryIndex++;
        }
      }
      if (queryIndex === query.length) return true;

      // Word matching in overview
      const words = query.split(/\s+/);
      return words.some((word) => overview.includes(word));
    });
  }, [searchQuery, preFiltered]);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <FadeIn>
        <div className="relative">
          <div className="relative flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3 md:px-5 md:py-3.5">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search molecules by name, synonyms, or properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-3 w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
              aria-label="Search molecules"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-muted-foreground">
              Found {filteredMolecules.length} of {moleculeCount} molecules
            </p>
          )}
        </div>
      </FadeIn>

      {/* Grid Display */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredMolecules.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No molecules match your search." : "No published molecules yet."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear search and try again
              </button>
            )}
          </div>
        ) : (
          filteredMolecules.map((molecule, index) => (
            <FadeIn key={molecule.id} delay={Math.min(index * 0.03, 0.18)}>
              <article className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-white">
                  <MoleculeImage
                    src={molecule.imageUrl || marketingImages.microscope}
                    alt={`${molecule.name} molecule page image`}
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
          ))
        )}
      </div>
    </div>
  );
}
