import { Bed, Bathtub, Ruler, MapPin } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cityLabel, listingTypeLabel, propertyTypeLabel } from "@/lib/constants";
import { formatMmk, resolvePhotoUrl } from "@/lib/format";
import type { Listing } from "@/types";

export function ListingCard({ listing }: { listing: Listing }) {
  const cover = [...listing.photos].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return (
    <Link to={`/listings/${listing.id}`}>
      <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
          {cover ? (
            <img
              src={resolvePhotoUrl(cover.url)}
              alt={listing.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              No photo
            </div>
          )}
        </div>
        <CardContent className="space-y-2 py-4">
          <div className="flex items-center gap-2">
            <Badge variant={listing.listingType === "SALE" ? "default" : "secondary"}>
              {listingTypeLabel(listing.listingType)}
            </Badge>
            <Badge variant="outline">{propertyTypeLabel(listing.propertyType)}</Badge>
          </div>
          <h3 className="line-clamp-1 font-semibold leading-tight">{listing.title}</h3>
          <p className="text-lg font-bold text-primary">{formatMmk(listing.priceMmk)}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            <span>
              {listing.township ? `${listing.township}, ` : ""}
              {cityLabel(listing.city)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="size-3.5" /> {listing.bedrooms}
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bathtub className="size-3.5" /> {listing.bathrooms}
              </span>
            )}
            {listing.areaSqft != null && (
              <span className="flex items-center gap-1">
                <Ruler className="size-3.5" /> {listing.areaSqft} sqft
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
