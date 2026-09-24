import type {
  AdminListingSearchParams,
  AdminUser,
  AuthResponse,
  CreateListingInput,
  Listing,
  ListingPhoto,
  ListingSearchParams,
  ListingStatus,
  PaginatedListings,
  UpdateListingInput,
  User,
} from "@/types";

export const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

const TOKEN_KEY = "property_portal_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    finalBody = body;
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data?.message ?? data?.error ?? message;
    } catch {
      // ignore body parse errors
    }
    throw new ApiError(res.status, message || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

function buildQuery(params: ListingSearchParams & { status?: ListingStatus }): string {
  const search = new URLSearchParams();
  if (params.city) search.set("city", params.city.toLowerCase());
  if (params.listing_type) search.set("listing_type", params.listing_type.toLowerCase());
  if (params.property_type) search.set("property_type", params.property_type.toLowerCase());
  if (params.min_price !== undefined) search.set("min_price", String(params.min_price));
  if (params.max_price !== undefined) search.set("max_price", String(params.max_price));
  if (params.bedrooms !== undefined) search.set("bedrooms", String(params.bedrooms));
  if (params.q) search.set("q", params.q);
  if (params.sort) search.set("sort", params.sort);
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  // Auth
  register: (input: { name: string; email: string; password: string; phone?: string }) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: input }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: input }),

  me: () => request<User>("/auth/me", { auth: true }),

  // Listings
  getListings: (params: ListingSearchParams = {}) =>
    request<PaginatedListings>(`/listings${buildQuery(params)}`),

  getListing: (id: number | string) => request<Listing>(`/listings/${id}`),

  createListing: (input: CreateListingInput) =>
    request<Listing>("/listings", { method: "POST", body: input, auth: true }),

  updateListing: (id: number | string, input: UpdateListingInput) =>
    request<Listing>(`/listings/${id}`, { method: "PUT", body: input, auth: true }),

  deleteListing: (id: number | string) =>
    request<void>(`/listings/${id}`, { method: "DELETE", auth: true }),

  uploadPhotos: (id: number | string, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append("photos", file);
    return request<ListingPhoto[]>(`/listings/${id}/photos`, {
      method: "POST",
      body: form,
      auth: true,
    });
  },

  deletePhoto: (listingId: number | string, photoId: number | string) =>
    request<void>(`/listings/${listingId}/photos/${photoId}`, {
      method: "DELETE",
      auth: true,
    }),

  // Current user's listings
  getMyListings: () => request<Listing[]>("/users/me/listings", { auth: true }),

  // Admin
  adminListListings: (params: AdminListingSearchParams = {}) =>
    request<PaginatedListings>(`/admin/listings${buildQuery(params)}`, { auth: true }),

  adminUpdateListing: (id: number | string, input: UpdateListingInput) =>
    request<Listing>(`/admin/listings/${id}`, { method: "PUT", body: input, auth: true }),

  adminDeleteListing: (id: number | string) =>
    request<void>(`/admin/listings/${id}`, { method: "DELETE", auth: true }),

  adminListUsers: () => request<AdminUser[]>("/admin/users", { auth: true }),
};
