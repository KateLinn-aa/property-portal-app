import type { City, ListingStatus, ListingType, PropertyType } from "@/types";

export const CITIES: { value: City; label: string }[] = [
  { value: "YANGON", label: "Yangon" },
  { value: "MANDALAY", label: "Mandalay" },
  { value: "BAGO", label: "Bago" },
];

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "CONDO", label: "Condo" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "LAND", label: "Land" },
];

export const LISTING_STATUSES: { value: ListingStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export const SORT_OPTIONS: { value: "newest" | "price_asc" | "price_desc"; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function cityLabel(value: City): string {
  return CITIES.find((c) => c.value === value)?.label ?? value;
}

export function listingTypeLabel(value: ListingType): string {
  return LISTING_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function propertyTypeLabel(value: PropertyType): string {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value;
}
