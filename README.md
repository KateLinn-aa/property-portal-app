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
reachable at the URL configured in `VITE_API_URL` (defaults to `http://localhost:4000`). Public
browsing/search works without login; creating an account is required to post or manage listings.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the `property-portal-api` REST API | `http://localhost:4000` |

## Project structure

```
src/
  components/       shared UI (Layout, ListingCard, RequireAuth, ThemeToggle) + components/ui (shadcn)
  lib/
    api.ts          typed fetch client for every endpoint in SPEC.md §6
    auth-context.tsx JWT auth state (useAuth hook)
    constants.ts     city/listing-type/property-type labels
    format.ts         MMK currency formatting, photo URL resolution
  pages/            Home, ListingDetail, Login, Register, NewListing, MyListings, Admin
  types.ts          TS types mirroring the Prisma schema (Listing, User, ListingPhoto, enums)
```

## Notes

- shadcn/ui was initialized with `npx shadcn@latest init --preset b7ClNFsdU --base base --yes --force --reinstall`
  (the `--base base` flag is required — without it the CLI auto-detects any pre-existing Radix
  dependency and silently serves a `radix-luma` variant instead of the requested `base-luma`).
  This resolves to Base UI primitives (`@base-ui/react`), the `luma` style, `mist` base color, and
  Phosphor icons (`@phosphor-icons/react`) rather than the more common Radix/Lucide combo. Components
  were added with `npx shadcn@latest add <name> --overwrite`.
- Light/dark mode is handled by `next-themes` (`ThemeProvider` in `src/main.tsx`, toggle button in
  `src/components/theme-toggle.tsx`), driving the `.dark` CSS variables in `src/index.css`. Defaults
  to the OS preference and persists the user's choice in `localStorage`.
- The JWT is stored in `localStorage` and attached as `Authorization: Bearer <token>` on
  authenticated requests via `src/lib/api.ts`.
- `/admin` (role `ADMIN` only) moderates every user's listings and lists all registered users —
  see `src/pages/admin.tsx`.
