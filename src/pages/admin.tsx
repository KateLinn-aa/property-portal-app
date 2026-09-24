import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import {
  CITIES,
  cityLabel,
  LISTING_STATUSES,
  listingTypeLabel,
  propertyTypeLabel,
} from "@/lib/constants";
import { formatMmk } from "@/lib/format";
import type { AdminListingSearchParams, City, Listing, ListingStatus } from "@/types";

const ANY = "ANY";
const PAGE_SIZE = 20;

const CITY_FILTER_ITEMS = [{ value: ANY, label: "Any city" }, ...CITIES];
const STATUS_FILTER_ITEMS = [{ value: ANY, label: "Any status" }, ...LISTING_STATUSES];

interface Filters {
  city: City | typeof ANY;
  status: ListingStatus | typeof ANY;
  q: string;
}

const initialFilters: Filters = { city: ANY, status: ANY, q: "" };

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Moderate listings and review registered users.
        </p>
      </div>

      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-4">
          <AdminListingsTab />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <AdminUsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminListingsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Listing | null>(null);

  const searchParams: AdminListingSearchParams = useMemo(() => {
    const params: AdminListingSearchParams = { page, limit: PAGE_SIZE, sort: "newest" };
    if (appliedFilters.city !== ANY) params.city = appliedFilters.city;
    if (appliedFilters.status !== ANY) params.status = appliedFilters.status;
    if (appliedFilters.q) params.q = appliedFilters.q;
    return params;
  }, [appliedFilters, page]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-listings", searchParams],
    queryFn: () => api.adminListListings(searchParams),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ListingStatus }) =>
      api.adminUpdateListing(id, { status }),
    onSuccess: () => {
      toast.success("Listing status updated");
      invalidate();
    },
    onError: () => toast.error("Could not update listing status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.adminDeleteListing(id),
    onSuccess: () => {
      toast.success("Listing deleted");
      setDeleting(null);
      invalidate();
    },
    onError: () => toast.error("Could not delete listing"),
  });

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  function resetFilters() {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  }

  const total = data?.pagination.total ?? 0;
  const totalPages = Math.max(1, data?.pagination.totalPages ?? 1);

  return (
    <div className="space-y-4">
      <form
        onSubmit={applyFilters}
        className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">Search</Label>
          <Input
            placeholder="Search by title or description..."
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
        </div>
        <div className="w-full space-y-1 sm:w-44">
          <Label className="text-xs text-muted-foreground">City</Label>
          <Select
            items={CITY_FILTER_ITEMS}
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
        <div className="w-full space-y-1 sm:w-44">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            items={STATUS_FILTER_ITEMS}
            value={filters.status}
            onValueChange={(v) => setFilters((f) => ({ ...f, status: v as Filters["status"] }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any status</SelectItem>
              {LISTING_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Apply</Button>
          <Button type="button" variant="ghost" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </form>

      {isError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load listings. Is the API running at the configured VITE_API_URL?
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {total} listing{total === 1 ? "" : "s"} found
          </p>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="max-w-[220px] truncate font-medium">
                      {listing.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{listing.user?.name ?? "—"}</span>
                        <span className="text-xs text-muted-foreground">
                          {listing.user?.email ?? ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{cityLabel(listing.city)}</TableCell>
                    <TableCell>{listingTypeLabel(listing.listingType)}</TableCell>
                    <TableCell>{propertyTypeLabel(listing.propertyType)}</TableCell>
                    <TableCell>{formatMmk(listing.priceMmk)}</TableCell>
                    <TableCell>
                      <Badge variant={listing.status === "ACTIVE" ? "default" : "destructive"}>
                        {listing.status === "ACTIVE" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              id: listing.id,
                              status: listing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                            })
                          }
                        >
                          {listing.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleting(listing)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-center gap-3">
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
      ) : (
        !isError && (
          <p className="py-16 text-center text-muted-foreground">
            No listings match these filters.
          </p>
        )
      )}

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete listing?</DialogTitle>
            <DialogDescription>
              This will permanently remove &ldquo;{deleting?.title}&rdquo; and its photos. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminUsersTab() {
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: api.adminListUsers,
  });

  return (
    <div className="space-y-4">
      {isError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load users. Is the API running at the configured VITE_API_URL?
        </p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "outline"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u.listingCount}</TableCell>
                  <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        !isError && (
          <p className="py-16 text-center text-muted-foreground">No users found.</p>
        )
      )}
    </div>
  );
}
