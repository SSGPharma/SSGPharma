"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { ProductSearch } from "@/components/marketing/product-search";
import { ManagedImage } from "@/components/web/managed-image";
import { getStableMarketingFallback } from "@/lib/marketing-images";
import { formatInrFromPaise } from "@/lib/money";
import { cn } from "@/lib/utils";

type DivisionProductItem = {
  id: string;
  slug: string;
  name: string;
  salts: string | null;
  description: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  pricePaise: number;
  priceSuffix: string | null;
  isActive: boolean;
};

type Props = {
  items: DivisionProductItem[];
  division: {
    slug?: string;
    title: string;
    catalogCategory: string;
  };
  page: number;
  totalCount: number;
  totalPages: number;
};

export function DivisionProductsList({ items, division, page, totalCount, totalPages }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/divisions/${division.slug ?? ""}${params.toString() ? `?${params.toString()}` : ""}`;
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    return items.filter((item) => {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [items, searchQuery]);

  return (
    <>
      <div className="mt-8 space-y-4">
        <ProductSearch value={searchQuery} placeholder={`Search ${division.title.toLowerCase()} products`} onFilter={setSearchQuery} />

        {items.length > 0 ? (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing <span className="font-semibold text-foreground">{filteredItems.length}</span> of{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> products
            </p>
            {searchQuery ? (
              <button type="button" onClick={() => setSearchQuery("")} className="text-primary hover:underline">
                Clear search
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <FadeIn>
              <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-muted-foreground">
                {searchQuery
                  ? `No medicines found matching "${searchQuery}". Try a different search term.`
                  : `No medicines tagged "${division.catalogCategory}" yet. Use that exact category in admin, or pick another division above.`}
              </p>
            </FadeIn>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const imageSrc = item.imageUrl1 || item.imageUrl2 || item.imageUrl3;
            const fallbackSrc = getStableMarketingFallback(`${item.id}:${item.name}`);

            return (
              <FadeIn key={item.id} delay={index * 0.02}>
                <Link
                  href={`/products/${item.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/50 transition-all hover:border-border hover:bg-card hover:shadow-md"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-muted">
                    <ManagedImage
                      src={imageSrc}
                      alt={item.name}
                      fallbackSrc={fallbackSrc}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-medium leading-tight transition-colors group-hover:text-primary">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.salts}</p>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <span className="text-sm font-semibold tabular-nums text-foreground">
                        {formatInrFromPaise(item.pricePaise)}{item.priceSuffix ? ` ${item.priceSuffix}` : ""}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap",
                          item.isActive ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            );
          })
        )}
      </div>

      {totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label={`${division.title} product pages`}>
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
              page <= 1 && "pointer-events-none opacity-50",
            )}
          >
            Previous
          </Link>
          <span className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>
          </span>
          <Link
            href={pageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={cn(
              "rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
              page >= totalPages && "pointer-events-none opacity-50",
            )}
          >
            Next
          </Link>
        </nav>
      ) : null}
    </>
  );
}
