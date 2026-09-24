import { API_URL } from "@/lib/api";

const mmkFormatter = new Intl.NumberFormat("en-US");

/** Formats a whole-number MMK amount, e.g. formatMmk(150000000) -> "150,000,000 MMK" */
export function formatMmk(amount: number): string {
  return `${mmkFormatter.format(amount)} MMK`;
}

/** Resolves a photo URL that may be relative (served from the API's /uploads path) or absolute. */
export function resolvePhotoUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
