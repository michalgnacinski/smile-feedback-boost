content = """# GEMINI.MD — DajOpinie.com.pl Project Documentation & Context

## 1. Project Overview & Business Logic
- **Project Name:** DajOpinie (dajopinie.com.pl)
- **Concept:** SaaS platform for restaurants, cafes, and local businesses designed to increase Google Maps reviews.
- **How it works:**
  1. Restaurant registers and creates custom QR codes for specific tables (e.g. `Stolik #01`, `Stolik #02`).
  2. The system generates an A4 PDF sheet with ultra-compact table cards (55x40 mm) formatted for small acrylic table-tents.
  3. A guest scans the QR code at the table -> redirected via `https://dajopinie.com.pl/r/:codeIdentifier` -> redirects to the restaurant's official Google Reviews 5-star direct rating link.
  4. Real-time analytics record every `SCAN` and `CLICK`, tracking conversion rates and table performance.
- **Pricing & Subscription:**
  - 14-day free trial on registration.
  - Subscription: Gastro Starter — 99 PLN net / month via Stripe.
  - Automated recurring invoicing via Stripe Customer Portal.

---

## 2. Tech Stack & Architecture

### Backend / API:
- **Runtime:** Node.js (v22+) / TypeScript with `tsx`
- **Framework:** Express.js (`api/index.ts`)
- **Database & ORM:** PostgreSQL on NeonDB (`@prisma/adapter-pg` + `pg` Pool) with Prisma ORM (`prisma/schema.prisma`).
- **PDF Engine:** `pdf-lib` (custom vector rendering for stars, gradients, Google multi-color branding, and QR embedding).
- **QR Code Generation:** `qrcode` npm library.
- **Mailing:** Resend API (`resend`) for onboarding and milestone notifications.
- **Payments:** Stripe API (Checkout Sessions, Webhooks, Customer Portal).
- **Hosting / Deployments:** Vercel (Serverless Functions / Node API) & GitHub repository.

### Frontend:
- **Framework:** React 18 / Vite / TypeScript.
- **Routing:** `@tanstack/react-router`.
- **UI Components & Styling:** Tailwind CSS, Shadcn UI (`@/components/ui`), Lucide React icons.
- **Charts:** `recharts` (`AreaChart`, `ResponsiveContainer`).
- **State & Notifications:** `sonner` toasts.

---

## 3. Project Structure & Key Files

```text
├── api/
│   └── index.ts                 # Express API server (auth, dashboard, qr-codes, pdf generator, stripe, places)
├── prisma/
│   └── schema.prisma            # Prisma schema (User, Restaurant, QRCode, AnalyticsEvent)
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── GoogleLinkCard.tsx       # Google review link management
│   │   │   ├── GoogleReviewsWidget.tsx  # Live Google Places rating & reviews display
│   │   │   ├── LogoUploadCard.tsx       # Restaurant logo upload (supports PNG/JPG up to 10MB)
│   │   │   ├── Overview.tsx             # Stats cards & 14-day scan charts
│   │   │   ├── QrTables.tsx             # Table management, QR downloads & bulk generation
│   │   │   └── TrialExpiredPaywall.tsx  # Paywall lock when trial expires
│   │   ├── ui/                          # Radix / Shadcn UI components
│   │   └── Logo.tsx                     # App branding logo
│   ├── routes/
│   │   ├── __root.tsx                   # App root layout & providers
│   │   ├── dashboard.tsx                # Main dashboard route & layout
│   │   ├── index.tsx                    # Landing page
│   │   ├── r.$slug.tsx                  # Public QR scan redirect route
│   │   └── privacy.tsx                  # Privacy policy & terms
│   └── lib/
│       └── services/dashboard.ts        # Dashboard API fetch helpers
├── .env                                 # Environment variables (DATABASE_URL, JWT_SECRET, STRIPE_*, RESEND_*)
├── package.json
└── vite.config.ts