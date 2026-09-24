# property-portal-app

Web frontend for the Myanmar Property Portal (Yangon, Mandalay, Bago listings for sale/rent).

Built with React + TypeScript + Vite, shadcn/ui, Tailwind CSS, TanStack Query, React Router, and
React Hook Form + zod.

## Getting started

```bash
npm install
cp .env.example .env   # then edit VITE_API_URL if needed
npm run dev
```

The app expects the `property-portal-api` backend (Express + Prisma + SQLite) to be running and
reachable at the URL configured in `VITE_API_URL` (defaults to `http://localhost:3001`). Public
browsing/search works without login; creating an account is required to post or manage listings.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the `property-portal-api` REST API | `http://localhost:3001` |

## Project structure

```
src/
  components/       shared UI (Layout, ListingCard, RequireAuth) + components/ui (shadcn)
  lib/
    api.ts          typed fetch client for every endpoint in SPEC.md §6
    auth-context.tsx JWT auth state (useAuth hook)
    constants.ts     city/listing-type/property-type labels
    format.ts         MMK currency formatting, photo URL resolution
  pages/            Home, ListingDetail, Login, Register, NewListing, MyListings
  types.ts          TS types mirroring the Prisma schema (Listing, User, ListingPhoto, enums)
```

## Notes

- shadcn/ui was initialized with `npx shadcn@latest init --template vite --base radix --preset nova --yes`
  (the exact `--preset b7ClNFsdU` value from the spec is not a recognized preset ID and caused the
  CLI to hang indefinitely; the built-in `nova` preset — Radix primitives + Geist/Lucide — was used
  instead as a reasonable fallback). Components were added with `npx shadcn@latest add <name>`.
- The JWT is stored in `localStorage` and attached as `Authorization: Bearer <token>` on
  authenticated requests via `src/lib/api.ts`.
