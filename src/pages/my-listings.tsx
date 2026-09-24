import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilSimple, Plus, Spinner, Trash, X } from "@phosphor-icons/react";
import { useEffect, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { cityLabel, CITIES, LISTING_TYPES, listingTypeLabel, PROPERTY_TYPES, propertyTypeLabel } from "@/lib/constants";
import { formatMmk, resolvePhotoUrl } from "@/lib/format";
import type { City, Listing, ListingType, PropertyType, UpdateListingInput } from "@/types";

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const { data: listings, isLoading, isError } = useQuery({
    queryKey: ["my-listings"],
    queryFn: api.getMyListings,
  });

  const [editing, setEditing] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState<Listing | null>(null);
  const [managingPhotos, setManagingPhotos] = useState<Listing | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    queryClient.invalidateQueries({ queryKey: ["listings"] });
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteListing(id),
    onSuccess: () => {
      toast.success("Listing deleted");
      setDeleting(null);
      invalidate();
    },
    onError: () => toast.error("Could not delete listing"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button render={<Link to="/listings/new" />} nativeButton={false}>
          <Plus className="size-4" /> New listing
        </Button>
      </div>

      {isError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load your listings. Is the API running?
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => {
            const cover = [...listing.photos].sort((a, b) => a.sortOrder - b.sortOrder)[0];
            return (
              <Card key={listing.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                    {cover ? (
                      <img
                        src={resolvePhotoUrl(cover.url)}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={listing.listingType === "SALE" ? "default" : "secondary"}>
                        {listingTypeLabel(listing.listingType)}
                      </Badge>
                      <Badge variant="outline">{propertyTypeLabel(listing.propertyType)}</Badge>
                      {listing.status === "INACTIVE" && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    <Link to={`/listings/${listing.id}`} className="font-semibold hover:underline">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {cityLabel(listing.city)} &middot; {formatMmk(listing.priceMmk)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setManagingPhotos(listing)}>
                      Photos
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(listing)}>
                      <PencilSimple className="size-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleting(listing)}>
                      <Trash className="size-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        !isError && (
          <p className="py-16 text-center text-muted-foreground">
            You haven&apos;t posted any listings yet.
          </p>
        )
      )}

      {editing && (
        <EditListingDialog
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            invalidate();
          }}
        />
      )}

      {managingPhotos && (
        <ManagePhotosDialog
          listing={managingPhotos}
          onClose={() => setManagingPhotos(null)}
          onChanged={invalidate}
        />
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

function EditListingDialog({
  listing,
  onClose,
  onSaved,
}: {
  listing: Listing;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    city: listing.city,
    township: listing.township ?? "",
    address: listing.address ?? "",
    priceMmk: String(listing.priceMmk),
    bedrooms: listing.bedrooms != null ? String(listing.bedrooms) : "",
    bathrooms: listing.bathrooms != null ? String(listing.bathrooms) : "",
    areaSqft: listing.areaSqft != null ? String(listing.areaSqft) : "",
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateListingInput) => api.updateListing(listing.id, input),
    onSuccess: () => {
      toast.success("Listing updated");
      onSaved();
    },
    onError: () => toast.error("Could not update listing"),
  });

  function submit() {
    updateMutation.mutate({
      title: form.title,
      description: form.description,
      listingType: form.listingType,
      propertyType: form.propertyType,
      city: form.city,
      township: form.township || undefined,
      address: form.address || undefined,
      priceMmk: Number(form.priceMmk),
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      areaSqft: form.areaSqft ? Number(form.areaSqft) : undefined,
    });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit listing</DialogTitle>
          <DialogDescription>Update the details for this listing.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Listing type</Label>
              <Select
                items={LISTING_TYPES}
                value={form.listingType}
                onValueChange={(v) => setForm((f) => ({ ...f, listingType: v as ListingType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Property type</Label>
              <Select
                items={PROPERTY_TYPES}
                value={form.propertyType}
                onValueChange={(v) => setForm((f) => ({ ...f, propertyType: v as PropertyType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select
                items={CITIES}
                value={form.city}
                onValueChange={(v) => setForm((f) => ({ ...f, city: v as City }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Township</Label>
              <Input
                value={form.township}
                onChange={(e) => setForm((f) => ({ ...f, township: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Price (MMK)</Label>
              <Input
                type="number"
                value={form.priceMmk}
                onChange={(e) => setForm((f) => ({ ...f, priceMmk: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bedrooms</Label>
              <Input
                type="number"
                value={form.bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bathrooms</Label>
              <Input
                type="number"
                value={form.bathrooms}
                onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Area (sqft)</Label>
              <Input
                type="number"
                value={form.areaSqft}
                onChange={(e) => setForm((f) => ({ ...f, areaSqft: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Spinner className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManagePhotosDialog({
  listing,
  onClose,
  onChanged,
}: {
  listing: Listing;
  onClose: () => void;
  onChanged: () => void;
}) {
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState(listing.photos);

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.uploadPhotos(listing.id, files),
    onSuccess: (newPhotos) => {
      setPhotos((prev) => [...prev, ...newPhotos]);
      onChanged();
      toast.success("Photos uploaded");
    },
    onError: () => toast.error("Could not upload photos"),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: number) => api.deletePhoto(listing.id, photoId),
    onSuccess: (_data, photoId) => {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      onChanged();
    },
    onError: () => toast.error("Could not remove photo"),
  });

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) uploadMutation.mutate(files);
    e.target.value = "";
  }

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["listing", String(listing.id)] });
  }, [queryClient, listing.id]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage photos</DialogTitle>
          <DialogDescription>Add or remove photos for &ldquo;{listing.title}&rdquo;.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md border">
              <img
                src={resolvePhotoUrl(photo.url)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => deleteMutation.mutate(photo.id)}
                disabled={deleteMutation.isPending}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove photo"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          {photos.length === 0 && (
            <p className="col-span-3 py-4 text-center text-sm text-muted-foreground">
              No photos yet.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="add-photos">Add photos</Label>
          <Input
            id="add-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploadMutation.isPending}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
