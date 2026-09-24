import { useQuery } from "@tanstack/react-query";
import { Bathtub, Bed, House, MapPin, Phone, Ruler, User } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cityLabel, listingTypeLabel, propertyTypeLabel } from "@/lib/constants";
import { formatMmk, resolvePhotoUrl } from "@/lib/format";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activePhoto, setActivePhoto] = useState(0);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => api.getListing(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Skeleton className="h-96 w-full rounded-lg md:col-span-2" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          This listing could not be found. It may have been removed, or the API is unreachable.
        </p>
        <Button render={<Link to="/" />} nativeButton={false} className="mt-4">
          Back to search
        </Button>
      </div>
    );
  }

  const photos = [...listing.photos].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {photos.length > 0 ? (
              <img
                src={resolvePhotoUrl(photos[activePhoto].url)}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No photos available
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setActivePhoto(idx)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 ${
                    idx === activePhoto ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={resolvePhotoUrl(photo.url)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={listing.listingType === "SALE" ? "default" : "secondary"}>
                {listingTypeLabel(listing.listingType)}
              </Badge>
              <Badge variant="outline">{propertyTypeLabel(listing.propertyType)}</Badge>
              {listing.status === "INACTIVE" && <Badge variant="destructive">Inactive</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-4" />
              {[listing.address, listing.township, cityLabel(listing.city)]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="text-3xl font-bold text-primary">{formatMmk(listing.priceMmk)}</p>

            <div className="flex flex-wrap gap-6 rounded-lg border bg-card p-4 text-sm">
              {listing.bedrooms != null && (
                <div className="flex items-center gap-2">
                  <Bed className="size-4 text-muted-foreground" />
                  {listing.bedrooms} Bedrooms
                </div>
              )}
              {listing.bathrooms != null && (
                <div className="flex items-center gap-2">
                  <Bathtub className="size-4 text-muted-foreground" />
                  {listing.bathrooms} Bathrooms
                </div>
              )}
              {listing.areaSqft != null && (
                <div className="flex items-center gap-2">
                  <Ruler className="size-4 text-muted-foreground" />
                  {listing.areaSqft} sqft
                </div>
              )}
              <div className="flex items-center gap-2">
                <House className="size-4 text-muted-foreground" />
                {propertyTypeLabel(listing.propertyType)}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <h2 className="font-semibold">Posted by</h2>
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-muted-foreground" />
                {listing.user?.name ?? "Property owner"}
              </div>
              {listing.user?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <a href={`tel:${listing.user.phone}`} className="hover:underline">
                    {listing.user.phone}
                  </a>
                </div>
              )}
              {!listing.user?.phone && (
                <p className="text-sm text-muted-foreground">
                  No phone number provided by the poster.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-6">
              <h2 className="font-semibold">Location</h2>
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {[listing.address, listing.township, cityLabel(listing.city), "Myanmar"]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
