# DajOpinie — frontend build plan

A three-surface B2B micro-SaaS frontend (Polish copy), all mock data, no backend.

## Design system

Dark "Minimalist Premium" theme applied globally in `src/styles.css`:

- Backgrounds: deep slate navy `#0F172A`, card/border `#1E293B`, emerald navy `#064E3B` accent surface
- CTA: golden yellow `#F59E0B`, hover `#D97706`
- Text: white, muted slate `#94A3B8`
- Inter + Plus Jakarta Sans loaded via `<link>` in the root route
- Sharp-ish radii, gold glow shadow token, all values as oklch semantic tokens (no hardcoded color classes in components)

## Page 1 — Landing (`/`)

Replaces the placeholder index page. Sections in order:
header/nav (logo + gold star, "Jak to działa", "Cennik", "FAQ", ghost "Zaloguj się", gold "Wypróbuj 14 dni za darmo"), hero (badge, headline, sub-headline, two CTAs, generated image of an acrylic QR desk stand on a restaurant table), 3-step feature grid, comparison table DajOpinie vs agencje, single pricing card (99 PLN netto/msc), FAQ accordion, footer with legal + Google/Omnibus compliance note.

Primary CTA opens a trial signup dialog (name + email, mock success toast).

## Page 2 — Mobile scan (`/r/$slug`)

Ultra-light centered `max-w-md` page, no nav. Restaurant logo placeholder + "Pizzeria La Torre", "Smakowało? Dziękujemy za wizytę! 🍕", sub-heading, one large glowing animated gold button with 5 stars that logs a mock analytics event then redirects to the Google review deep link, plus bottom micro-text. Slug parsed as `pizzeria-la-torre-01` → name + table id.

## Page 3 — Dashboard (`/dashboard`)

Desktop-friendly layout with collapsible sidebar (restaurant selector dropdown + 4 nav links, mobile drawer). Overview tab: 4 stat cards (248 skanów +18%, 164 przejścia 66.1%, ~25-30 opinii, trial badge 9 dni), Recharts line chart of last 14 days, Google review link config card with edit dialog and help tooltip, QR table (Stolik #01/#02/Bar-Lada with scans/clicks/conversion and Pobierz PNG / Drukuj PDF actions) plus "+ Dodaj nowy stolik" dialog. Other nav links switch the dashboard's inner view (QR codes, Google link settings, payments) using local state.

## View switcher

A small fixed dev-only switcher chip letting you jump between Landing / Mobile Scan / Dashboard without typing URLs.

## Technical notes

- TanStack Router file routes: `src/routes/index.tsx`, `src/routes/r.$slug.tsx`, `src/routes/dashboard.tsx`
- Landing split into components under `src/components/landing/`, dashboard under `src/components/dashboard/`
- shadcn/ui: Card, Button, Input, Table, Dialog, Badge, Tabs, Accordion, Tooltip, DropdownMenu, Sonner
- Mock data in `src/lib/mock-data.ts`; QR PNG/PDF actions show toasts (no real generation)
- Per-route `head()` metadata with unique Polish titles/descriptions
