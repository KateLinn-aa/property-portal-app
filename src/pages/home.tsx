import { useQuery } from "@tanstack/react-query";
import { Check, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { useMemo, useRef, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { CITIES, LISTING_TYPES, PROPERTY_TYPES, SORT_OPTIONS } from "@/lib/constants";
import type { City, ListingSearchParams, ListingType, PropertyType } from "@/types";

const ANY = "ANY";
const PAGE_SIZE = 12;

const HERO_LISTING_TYPE_ITEMS = [{ value: ANY, label: "Buy or rent" }, ...LISTING_TYPES];
const HERO_CITY_ITEMS = [{ value: ANY, label: "All Myanmar" }, ...CITIES];
const DETAILED_CITY_ITEMS = [{ value: ANY, label: "Any city" }, ...CITIES];
const DETAILED_LISTING_TYPE_ITEMS = [{ value: ANY, label: "Sale or rent" }, ...LISTING_TYPES];
const DETAILED_PROPERTY_TYPE_ITEMS = [{ value: ANY, label: "Any type" }, ...PROPERTY_TYPES];

interface Filters {
  q: string;
  city: City | typeof ANY;
  listingType: ListingType | typeof ANY;
  propertyType: PropertyType | typeof ANY;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  sort: NonNullable<ListingSearchParams["sort"]>;
}

const initialFilters: Filters = {
  q: "",
  city: ANY,
  listingType: ANY,
  propertyType: ANY,
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
  sort: "newest",
};

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchParams: ListingSearchParams = useMemo(() => {
    const params: ListingSearchParams = {
      page,
      limit: PAGE_SIZE,
      sort: appliedFilters.sort,
    };
    if (appliedFilters.q) params.q = appliedFilters.q;
    if (appliedFilters.city !== ANY) params.city = appliedFilters.city;
    if (appliedFilters.listingType !== ANY) params.listing_type = appliedFilters.listingType;
    if (appliedFilters.propertyType !== ANY) params.property_type = appliedFilters.propertyType;
    if (appliedFilters.minPrice) params.min_price = Number(appliedFilters.minPrice);
    if (appliedFilters.maxPrice) params.max_price = Number(appliedFilters.maxPrice);
    if (appliedFilters.bedrooms) params.bedrooms = Number(appliedFilters.bedrooms);
    return params;
  }, [appliedFilters, page]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["listings", searchParams],
    queryFn: () => api.getListings(searchParams),
  });

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  function applyHeroSearch(e: React.FormEvent) {
    applyFilters(e);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  }

  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border bg-secondary/40">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:p-14">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkle className="size-4" weight="fill" />
              Find your next home
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
              Space to live, <span className="text-primary">beautifully.</span>
            </h1>
            <p className="max-w-md text-muted-foreground">
              Discover considered homes, apartments, and land for sale or rent
              across Yangon, Mandalay, and Bago.
            </p>

            <form
              onSubmit={applyHeroSearch}
              className="flex flex-col gap-2 rounded-xl border bg-card p-2 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, township, or city..."
                  className="border-0 pl-9 shadow-none focus-visible:ring-0"
                  value={filters.q}
                  onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <Select
                  items={HERO_LISTING_TYPE_ITEMS}
                  value={filters.listingType}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, listingType: v as Filters["listingType"] }))
                  }
                >
                  <SelectTrigger className="border-0 shadow-none sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>Buy or rent</SelectItem>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  items={HERO_CITY_ITEMS}
                  value={filters.city}
                  onValueChange={(v) => setFilters((f) => ({ ...f, city: v as Filters["city"] }))}
                >
                  <SelectTrigger className="border-0 shadow-none sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY}>All Myanmar</SelectItem>
                    {CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="sm:w-auto">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-primary" weight="bold" />
                Free to list
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-primary" weight="bold" />
                Buy, sell &amp; rent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-primary" weight="bold" />3 cities across Myanmar
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
              alt="A bright, considered living space"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-lg"
            />
            <div className="absolute -bottom-5 -left-5 rounded-xl border bg-card p-4 shadow-md">
              <p className="text-2xl font-bold text-primary">
                {data?.pagination.total ?? "20+"}
              </p>
              <p className="text-xs text-muted-foreground">listings live now</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="scroll-mt-20 rounded-lg border bg-card p-4 sm:p-6">
        <form onSubmit={applyFilters} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                className="pl-9"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              />
            </div>
            <Button type="submit" className="sm:w-auto">
              Search
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">City</Label>
              <Select
                items={DETAILED_CITY_ITEMS}
                value={filters.city}
                onValueChange={(v) => setFilters((f) => ({ ...f, city: v as Filters["city"] }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any city</SelectItem>
                  {CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Listing type</Label>
              <Select
                items={DETAILED_LISTING_TYPE_ITEMS}
                value={filters.listingType}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, listingType: v as Filters["listingType"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Sale or rent</SelectItem>
                  {LISTING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Property type</Label>
              <Select
                items={DETAILED_PROPERTY_TYPE_ITEMS}
                value={filters.propertyType}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, propertyType: v as Filters["propertyType"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any type</SelectItem>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min price (MMK)</Label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Max price (MMK)</Label>
              <Input
                type="number"
                min={0}
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Min bedrooms</Label>
              <Input
                type="number"
                min={0}
                placeholder="Any"
                value={filters.bedrooms}
                onChange={(e) => setFilters((f) => ({ ...f, bedrooms: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Sort by</Label>
              <Select
                items={SORT_OPTIONS}
                value={filters.sort}
                onValueChange={(v) => setFilters((f) => ({ ...f, sort: v as Filters["sort"] }))}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" variant="ghost" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        </form>
      </section>

      <section>
        {isError && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load listings. Is the API running at the configured VITE_API_URL?
          </p>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-lg" />
            ))}
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {total} listing{total === 1 ? "" : "s"} found
              {isFetching ? " (updating...)" : ""}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.data.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </>
        ) : !isError ? (
          <p className="py-16 text-center text-muted-foreground">
            No listings match your search. Try adjusting your filters.
          </p>
        ) : null}
      </section>
    </div>
  );
}
