// Mirrors the Prisma models from property-portal-api (see SPEC.md §4)

export type ListingType = "SALE" | "RENT";

export type PropertyType = "CONDO" | "APARTMENT" | "HOUSE" | "LAND";

export type City = "YANGON" | "MANDALAY" | "BAGO";

export type ListingStatus = "ACTIVE" | "INACTIVE";

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  listingCount: number;
}

export interface ListingPhoto {
  id: number;
  listingId: number;
  url: string;
  sortOrder: number;
}

export interface Listing {
  id: number;
  userId: number;
  user?: Pick<User, "id" | "name" | "phone" | "email">;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  city: City;
  township: string | null;
  address: string | null;
  priceMmk: number;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  photos: ListingPhoto[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedListings {
  data: Listing[];
  pagination: Pagination;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ListingSearchParams {
  city?: City;
  listing_type?: ListingType;
  property_type?: PropertyType;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface CreateListingInput {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  city: City;
  township?: string;
  address?: string;
  priceMmk: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
}

export type UpdateListingInput = Partial<CreateListingInput> & {
  status?: ListingStatus;
};

export type AdminListingSearchParams = ListingSearchParams & {
  status?: ListingStatus;
};
