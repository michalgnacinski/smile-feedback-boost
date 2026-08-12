# DajOpinie Growth Engine

Act as a Principal UI/UX Designer and Senior React Engineer. Build a high-converting, production-ready frontend for a B2B Micro-SaaS called "DajOpinie" (DajOpinie.pl) using React, Tailwind CSS, shadcn/ui components, and Lucide icons.

### 1. BRAND IDENTITY & DESIGN SYSTEM

- Theme: Minimalist Premium / Clean Tech.

- Color Palette:

  * Primary / Backgrounds: Deep Slate Navy (`#0F172A`), Dark Emerald Navy (`#064E3B`).

  * Accent / CTA: Warm Golden Yellow (`#F59E0B`), Gold Hover (`#D97706`).

  * Text & Cards: Clean White (`#FFFFFF`), Muted Slate (`#94A3B8`), Soft Gray Border (`#1E293B`).

- Typography: Clean sans-serif (Inter / Plus Jakarta Sans), high contrast, ultra-sharp edges.

- Mobile First mindset for Page 2, Desktop-friendly for Dashboard (Page 3).

---

### 2. PAGE 1: LANDING PAGE (DajOpinie.pl)

Create a modern B2B Landing Page structured into the following sections:

- Header / Navigation:

  * Logo: Text "DajOpinie" with a subtle gold star icon next to it.

  * Nav links: "Jak to działa", "Cennik", "FAQ".

  * Action button: "Zaloguj się" (ghost button) + "Wypróbuj 14 dni za darmo" (Gold primary button).

- Hero Section:

  * Badge: "Dla restauracji, kawiarni i lokalnej gastronomii 🍕".

  * Main Headline: "Więcej 5-gwiazdkowych opinii w Google. Zero pracy dla Twojego zespołu."

  * Sub-headline: "Nasz pasywny system ze stojakiem QR na stoliku przekierowuje gości czekających na rachunek bezpośrednio do pisania opinii w Google. Bez kuponów, bez ryzyka bana, w 100% zgodnie z zasadami Google."

  * Primary CTA: "Rozpocznij 14-dniowy darmowy test" (Opens modal or registers without credit card).

  * Secondary CTA: "Zobacz jak to działa (Demo QR)".

  * Visual Element: High-quality mockup of an elegant acrylic desk stand with a QR code placed on a restaurant table.

- Feature Grid (3 Steps):

  1. "Krok 1: Postaw stojak QR": Dedykowany kod QR na stoliku lub przy kasie.

  2. "Krok 2: Bezpośrednie przekierowanie": Gość skanuje kod i jednym kliknięciem trafia do aplikacji Google Maps.

  3. "Krok 3: Analizuj i rośnij": Śledź statystyki skanów i wyprzedzaj lokalną konkurencję.

- Comparison Table ("Dlaczego DajOpinie?"):

  * Compare DajOpinie (99 PLN/msc, 100% Google Compliant, Zero pracy zespołu, Brak umów rocznych) vs Droga Konkurencja / Agencje (1000+ PLN/msc, Ryzykowne rabaty, Umowy na 12 miesięcy).

- Pricing Section:

  * Single Plan Card: "Plan Gastro Starter" — 99 PLN netto / miesiąc (or ~$25/mo).

  * Features list: Nielimitowane skany QR, Generator kodów dla wielu stolików, Pełny panel analityczny, Dostęp do gotowych szablonów do druku (PDF), Anulowanie 1-kliknięciem.

  * CTA: "Aktywuj 14 dni za darmo (Bez karty)".

- Footer:

  * Copyrights, Privacy Policy, Terms of Service, "100% Zgodne z wytycznymi Google Maps i Dyrektywą Omnibus".

---

### 3. PAGE 2: MOBILE SCAN PAGE (`/r/[restaurant-slug]-[table-id]`)

Create an ultra-lightweight, lightning-fast mobile landing page displayed when a customer scans a QR code at a restaurant table:

- Mobile-optimized container (max-w-md, centered, zero clutter, no header/footer navigation).

- Top: Restaurant Logo placeholder + Restaurant Name ("Pizzeria La Torre").

- Friendly Heading: "Smakowało? Dziękujemy za wizytę! 🍕".

- Sub-heading: "Twoja opinia pomaga naszej małej restauracji rosnąć i docierać do nowych gości."

- Main Action Button (Hero Element): A big, glowing, animated Gold Button with 5 Gold Stars icon:

  * Text: "⭐⭐⭐⭐⭐ Oceń nas w Google"

  * Action: On click, record event in analytics and trigger deep link redirect to the Google Review Link (`https://g.page/r/.../review`).

- Secondary micro-text at bottom: "Skanowanie zajmuje 5 sekund. Nie wymagamy zakładania konta."

---

### 4. PAGE 3: MERCHANT DASHBOARD (`/dashboard`)

Create an intuitive, minimal B2B Dashboard for the restaurant owner (`app.dajopinie.pl`):

- Sidebar / Top Navigation:

  * Restaurant selector (dropdown: "Pizzeria La Torre").

  * Links: "Przegląd (Dashboard)", "Kody QR i Stojaki", "Ustawienia Google Link", "Płatności".

- Overview Cards (Top Row Stats):

  1. "Wszystkie skany QR": e.g., 248 (with +18% badge vs last week).

  2. "Przejścia do Google": e.g., 164 (with conversion rate 66.1%).

  3. "Szacowane nowe opinie": e.g., ~25-30 w tym miesiącu.

  4. "Status Subskrypcji": Badge "Okres Próbny (Zostało 9 dni)".

- Chart Section:

  * Line chart (using Recharts or Lucide UI) showing "Liczba skanów QR w ostatnich 14 dniach".

- Google Review Link Configuration Card:

  * Input field showing their saved Google Review Link: `https://g.page/r/ExampleID/review`.

  * Edit button + "Jak pobrać ten link z Google Maps?" tooltip.

- QR Code Generator & Table Management Section:

  * Table listing active QR codes:

    - Label (e.g., "Stolik #01", "Stolik #02", "Bar/Lada").

    - Scans count, Clicks count, Conversion %.

    - Actions: "Pobierz QR (PNG)", "Drukuj Stojak (PDF)".

  * Button: "+ Dodaj nowy stolik / kod QR".

---

### 5. TECHNICAL INSTRUCTIONS FOR CODE GENERATION

- Use Tailwind CSS for all styling.

- Use `shadcn/ui` components (Card, Button, Input, Table, Dialog, Badge, Tabs).

- Include state management mockups so I can toggle between views (Landing, Mobile Scan View, Dashboard) easily.

- Make the design fully responsive, clean, and bug-free.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://smile-feedback-boost.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cc1d8129-bb2c-4a4e-9eb0-035845b6dc76).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
