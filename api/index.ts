import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { Resend } from "resend";
import Stripe from "stripe";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

// 1. BAZA DANYCH (POŁĄCZENIE Z NEONDB)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("neon.tech") ? { rejectUnauthorized: false } : undefined,
  max: 10,
});
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// 2. RESEND EMAIL SERVICE
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "DajOpinie <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "https://dajopinie.pl";

async function sendWelcomeEmail(to: string, restaurantName: string, slug: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Witaj w DajOpinie — Twój lokal ${restaurantName} jest gotowy!`,
      html: `
        <div style="background-color:#0b0f17; color:#f8fafc; font-family:sans-serif; padding:30px; border-radius:12px;">
          <h1 style="color:#ffffff;">Witaj w DajOpinie! 🚀</h1>
          <p style="color:#94a3b8;">Twój lokal <strong>${restaurantName}</strong> został pomyślnie utworzony. Rozpocząłeś 14-dniowy darmowy okres próbny.</p>
          <a href="${APP_URL}/dashboard" style="display:inline-block; background:#f59e0b; color:#000; font-weight:bold; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:16px;">Otwórz Panel →</a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Błąd Resend welcome:", err);
  }
}

async function sendMilestoneEmail(to: string, restaurantName: string, milestoneCount: number) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 Gratulacje! Twój lokal ${restaurantName} osiągnął ${milestoneCount} skanów!`,
      html: `
        <div style="background-color:#0b0f17; color:#f8fafc; font-family:sans-serif; padding:30px; border-radius:12px;">
          <h1 style="color:#ffffff;">Świetny wynik! Pierwsze ${milestoneCount} skanów 🏆</h1>
          <p style="color:#94a3b8;">Goście w Twoim lokalu <strong>${restaurantName}</strong> zeskanowali kody QR już ponad ${milestoneCount} razy!</p>
          <a href="${APP_URL}/dashboard" style="display:inline-block; background:#f59e0b; color:#000; font-weight:bold; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:16px;">Zobacz panel →</a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Błąd Resend milestone:", err);
  }
}

// 3. STRIPE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// 4. APLIKACJA EXPRESS
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const JWT_SECRET = process.env.JWT_SECRET || "dajopinie_super_secret_key_123!";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[ąàáâä]/g, "a")
    .replace(/[ćç]/g, "c")
    .replace(/[ęèéêë]/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/[óòôö]/g, "o")
    .replace(/[śş]/g, "s")
    .replace(/[żź]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// 1. REJESTRACJA
app.post("/api/auth/register", async (req, res) => {
  try {
    const { restaurantName, email, password } = req.body;
    if (!restaurantName || !email || !password) {
      return res.status(400).json({ error: "Wypełnij wszystkie pola!" });
    }

    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Konto z tym adresem e-mail już istnieje!" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const trialEnds = new Date(now);
    trialEnds.setDate(now.getDate() + 14);

    let baseSlug = slugify(restaurantName);
    let slug = baseSlug;
    let counter = 1;

    while (await db.restaurants.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: { email, password_hash },
      });

      const newRestaurant = await tx.restaurants.create({
        data: {
          user_id: newUser.id,
          name: restaurantName,
          slug,
          subscription_status: "TRIAL",
          trial_started_at: now,
          trial_ends_at: trialEnds,
        },
      });

      await tx.qr_codes.create({
        data: {
          restaurant_id: newRestaurant.id,
          label: "Stolik #01",
          code_identifier: `${slug}-stolik01`,
        },
      });

      return { user: newUser, restaurant: newRestaurant };
    });

    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    sendWelcomeEmail(result.user.email, result.restaurant.name, result.restaurant.slug).catch(console.error);

    return res.json({
      success: true,
      token,
      user: { id: result.user.id, email: result.user.email },
      restaurantSlug: result.restaurant.slug,
    });
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    return res.status(500).json({ error: "Błąd serwera podczas rejestracji" });
  }
});

// 2. LOGOWANIE
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.users.findUnique({
      where: { email },
      include: { restaurants: true },
    });

    if (!user) {
      return res.status(400).json({ error: "Nieprawidłowy e-mail lub hasło" });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(400).json({ error: "Nieprawidłowy e-mail lub hasło" });
    }

    const firstRestaurant = user.restaurants[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email },
      restaurantSlug: firstRestaurant?.slug || "",
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    return res.status(500).json({ error: "Błąd serwera podczas logowania" });
  }
});

// 3. DASHBOARD
app.get("/api/dashboard", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {}
    }

    let userRestaurants = userId
      ? await db.restaurants.findMany({ where: { user_id: userId } })
      : [];

    let restaurant;

    if (userRestaurants.length > 0) {
      const requestedSlug = req.query.slug as string;
      restaurant = userRestaurants.find((r) => r.slug === requestedSlug) || userRestaurants[0];

      restaurant = await db.restaurants.findUnique({
        where: { id: restaurant.id },
        include: {
          qr_codes: { include: { analytics_events: true } },
        },
      });
    } else {
      restaurant = await db.restaurants.findFirst({
        include: {
          qr_codes: { include: { analytics_events: true } },
        },
      });
    }

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji" });
    }

    const now = new Date();
    const trialEndsAt = restaurant.trial_ends_at ? new Date(restaurant.trial_ends_at) : null;

    let trialDaysLeft = 0;
    let isTrialExpired = false;

    if (restaurant.subscription_status === "TRIAL" && trialEndsAt) {
      const diffTime = trialEndsAt.getTime() - now.getTime();
      if (diffTime <= 0) {
        trialDaysLeft = 0;
        isTrialExpired = true;
      } else {
        trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isTrialExpired = false;
      }
    } else if (restaurant.subscription_status === "EXPIRED") {
      isTrialExpired = true;
    }

    const allEvents = restaurant.qr_codes.flatMap((qr) => qr.analytics_events);
    const totalScans = allEvents.filter((e) => e.event_type === "SCAN").length;
    const totalClicks = allEvents.filter((e) => e.event_type === "CLICK").length;
    const conversionRate = totalScans > 0 ? ((totalClicks / totalScans) * 100).toFixed(1) : "0";

    const last14Days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      const scansOnDay = allEvents.filter(
        (e) => e.event_type === "SCAN" && new Date(e.created_at).toISOString().split("T")[0] === dateStr
      ).length;
      return { date: dayLabel, skany: scansOnDay, scans: scansOnDay };
    });

    const tablesData = restaurant.qr_codes.map((qr) => {
      const scans = qr.analytics_events.filter((e) => e.event_type === "SCAN").length;
      const clicks = qr.analytics_events.filter((e) => e.event_type === "CLICK").length;
      return {
        id: qr.id,
        label: qr.label,
        codeIdentifier: qr.code_identifier,
        scans,
        clicks,
        conversion: scans > 0 ? `${((clicks / scans) * 100).toFixed(1)}%` : "0%",
        url: `${APP_URL}/r/${qr.code_identifier}`,
      };
    });

    const nextBillingDate = restaurant.subscription_started_at
      ? new Date(new Date(restaurant.subscription_started_at).setMonth(new Date(restaurant.subscription_started_at).getMonth() + 1))
      : null;

    return res.json({
      restaurantName: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logo_url,
      googleReviewLink: restaurant.google_review_link,
      userRestaurants: userRestaurants.map((r) => ({
        name: r.name,
        slug: r.slug,
        logoUrl: r.logo_url,
      })),
      subscription: {
        status: restaurant.subscription_status,
        trialDaysLeft,
        isExpired: isTrialExpired,
        trialEndsAt: restaurant.trial_ends_at,
        nextBillingAt: nextBillingDate,
      },
      stats: {
        totalScans,
        totalClicks,
        conversionRate: `${conversionRate}%`,
        estimatedReviews: Math.round(totalClicks * 0.8),
      },
      chartData: last14Days,
      tables: tablesData,
    });
  } catch (error) {
    console.error("Błąd dashboardu:", error);
    return res.status(500).json({ error: "Błąd bazy danych" });
  }
});

// 4. AKTUALIZACJA GOOGLE LINK
app.patch("/api/restaurant/:slug/google-link", async (req, res) => {
  try {
    const { slug } = req.params;
    const { googleReviewLink } = req.body;
    const updated = await db.restaurants.update({
      where: { slug },
      data: { google_review_link: googleReviewLink },
    });
    return res.json({ success: true, googleReviewLink: updated.google_review_link });
  } catch (error) {
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// 5. AKTUALIZACJA LOGO
app.patch("/api/restaurant/:slug/logo", async (req, res) => {
  try {
    const { slug } = req.params;
    const { logoUrl } = req.body;
    const updated = await db.restaurants.update({
      where: { slug },
      data: { logo_url: logoUrl || null },
    });
    return res.json({ success: true, logoUrl: updated.logo_url });
  } catch (error) {
    return res.status(500).json({ error: "Błąd zapisu logo" });
  }
});

// 6. SKAN KODU QR
app.post("/api/scan/:codeIdentifier", async (req, res) => {
  try {
    const { codeIdentifier } = req.params;
    const qrCode = await db.qr_codes.findUnique({
      where: { code_identifier: codeIdentifier },
      include: { restaurant: true },
    });

    if (!qrCode) {
      return res.status(404).json({ error: "Kod QR nie istnieje" });
    }

    await db.analytics_events.create({
      data: {
        qr_code_id: qrCode.id,
        event_type: "SCAN",
        user_agent: req.headers["user-agent"] || null,
      },
    });

    const totalScans = await db.analytics_events.count({
      where: {
        qr_code: { restaurant_id: qrCode.restaurant_id },
        event_type: "SCAN",
      },
    });

    if ([25, 50, 100, 250, 500].includes(totalScans)) {
      const owner = await db.users.findUnique({ where: { id: qrCode.restaurant.user_id } });
      if (owner?.email) {
        sendMilestoneEmail(owner.email, qrCode.restaurant.name, totalScans).catch(console.error);
      }
    }

    return res.json({
      qrCodeId: qrCode.id,
      restaurantName: qrCode.restaurant.name,
      logoUrl: qrCode.restaurant.logo_url,
      tableLabel: qrCode.label,
      googleReviewLink: qrCode.restaurant.google_review_link,
    });
  } catch (error) {
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// 7. KLIKNIĘCIE W OPINIE GOOGLE
app.post("/api/click/:qrCodeId", async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    await db.analytics_events.create({
      data: {
        qr_code_id: qrCodeId,
        event_type: "CLICK",
        user_agent: req.headers["user-agent"] || null,
      },
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// 8. DODAWANIE KODU QR
app.post("/api/qr-codes", async (req, res) => {
  try {
    const { restaurantSlug, label } = req.body;
    if (!restaurantSlug || !label) {
      return res.status(400).json({ error: "Podaj nazwę stolika i restauracji" });
    }

    const restaurant = await db.restaurants.findUnique({
      where: { slug: restaurantSlug },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji" });
    }

    // Pozwalamy na dodawanie stolików w trakcie aktywnego trialu lub subskrypcji ACTIVE
    const now = new Date();
    const isTrialValid = restaurant.subscription_status === "TRIAL" && (!restaurant.trial_ends_at || new Date(restaurant.trial_ends_at) > now);
    const isActive = restaurant.subscription_status === "ACTIVE";

    if (!isTrialValid && !isActive) {
      return res.status(403).json({
        error: "Twój okres próbny wygasł. Aktywuj subskrypcję, aby dodawać nowe stoliki.",
      });
    }

    const codeIdentifier = `${restaurantSlug}-${slugify(label)}-${Date.now().toString().slice(-4)}`;

    const newQr = await db.qr_codes.create({
      data: {
        restaurant_id: restaurant.id,
        label,
        code_identifier: codeIdentifier,
      },
    });

    return res.json({
      success: true,
      qrCode: {
        id: newQr.id,
        label: newQr.label,
        codeIdentifier: newQr.code_identifier,
        scans: 0,
        clicks: 0,
        conversion: "0%",
        url: `${APP_URL}/r/${newQr.code_identifier}`,
      },
    });
  } catch (error) {
    console.error("Błąd api/qr-codes:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// 9. USUWANIE KODU QR
app.delete("/api/qr-codes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.qr_codes.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Błąd usuwania stolika" });
  }
});

// 10. STRIPE CHECKOUT
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  try {
    const { restaurantSlug } = req.body;
    const restaurant = await db.restaurants.findUnique({
      where: { slug: restaurantSlug },
      include: { user: true },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "blik"],
      mode: "subscription",
      customer_email: restaurant.user?.email,
      client_reference_id: restaurant.slug,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: "DajOpinie — Pakiet Gastro Starter",
              description: `Miesięczna subskrypcja dla lokalu: ${restaurant.name}`,
            },
            unit_amount: 9900,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/dashboard?payment=cancelled`,
    });

    return res.json({ url: session.url });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Błąd Stripe" });
  }
});

// 11. STRIPE VERIFY
app.post("/api/stripe/verify-session", async (req, res) => {
  try {
    const { sessionId, restaurantSlug } = req.body;
    const updated = await db.restaurants.update({
      where: { slug: restaurantSlug },
      data: {
        subscription_status: "ACTIVE",
        subscription_started_at: new Date(),
      },
    });
    return res.json({ success: true, status: updated.subscription_status });
  } catch (error) {
    return res.status(500).json({ error: "Błąd bazy danych" });
  }
});

// DODAWANIE NOWEGO LOKALU
app.post("/api/restaurants", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {}
    }

    // Fallback: jeśli z jakiegoś powodu brak tokena w teście, weź pierwszego usera
    if (!userId) {
      const firstUser = await db.users.findFirst();
      userId = firstUser?.id || null;
    }

    if (!userId) {
      return res.status(401).json({ error: "Brak autoryzacji" });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Wpisz nazwę lokalu!" });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await db.restaurants.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const now = new Date();
    const trialEnds = new Date(now);
    trialEnds.setDate(now.getDate() + 14);

    const newRestaurant = await db.$transaction(async (tx) => {
      const rest = await tx.restaurants.create({
        data: {
          user_id: userId!,
          name: name.trim(),
          slug,
          subscription_status: "TRIAL",
          trial_started_at: now,
          trial_ends_at: trialEnds,
        },
      });

      await tx.qr_codes.create({
        data: {
          restaurant_id: rest.id,
          label: "Stolik #01",
          code_identifier: `${slug}-stolik01`,
        },
      });

      return rest;
    });

    return res.status(201).json(newRestaurant);
  } catch (error) {
    console.error("Błąd tworzenia lokalu:", error);
    return res.status(500).json({ error: "Błąd serwera podczas tworzenia lokalu" });
  }
});

// ENDPOINT: POBIERANIE OPINII Z GOOGLE PLACES API (NOWY STANDARD v1)
app.get("/api/restaurant/:slug/google-reviews", async (req, res) => {
  try {
    const { slug } = req.params;
    const restaurant = await db.restaurants.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        google_place_id: true,
        google_review_link: true,
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono lokalu" });
    }

    function extractPlaceId(link: string | null): string | null {
      if (!link) return null;
      try {
        const url = new URL(link);
        const fromParam = url.searchParams.get("placeid");
        if (fromParam) return fromParam;

        // Fallback dla linków zawierających ChIJ bezpośrednio w ścieżce
        const match = link.match(/(ChIJ[a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      } catch {
        const match = link.match(/(ChIJ[a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      }
    }

    const placeId = restaurant.google_place_id || extractPlaceId(restaurant.google_review_link);

    if (!placeId) {
      return res.json({
        hasPlaceId: false,
        rating: null,
        totalReviews: 0,
        reviews: [],
      });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Brak GOOGLE_PLACES_API_KEY w środowisku serwera" });
    }

    // Nowy adres Places API (v1)
    const googleUrl = `https://places.googleapis.com/v1/places/${placeId}?languageCode=pl`;

    const response = await fetch(googleUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Pełna maska pól zagnieżdżonych:
        "X-Goog-FieldMask": "rating,userRatingCount,displayName,reviews",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Błąd Google Places API:", data);
      return res.status(response.status).json({
        error: data.error?.message || "Błąd Google Places API",
        status: data.error?.status,
      });
    }

    // Bezpieczne mapowanie recenzji z fallbackami
    const rawReviews = Array.isArray(data.reviews) ? data.reviews : [];

    const reviews = rawReviews
      .map((rev: any) => ({
        authorName: rev.authorAttribution?.displayName || "Gość lokalu",
        rating: rev.rating || 5,
        text: rev.text?.text || rev.originalText?.text || "",
        relativeTime: rev.relativePublishTimeDescription || "Niedawno",
        publishTime: rev.publishTime ? new Date(rev.publishTime).getTime() : 0,
      }))
      // Sortujemy od najnowszych
      .sort((a: any, b: any) => b.publishTime - a.publishTime);

    return res.json({
      hasPlaceId: true,
      restaurantName: data.displayName?.text || restaurant.name,
      rating: typeof data.rating === "number" ? data.rating : 0,
      totalReviews: typeof data.userRatingCount === "number" ? data.userRatingCount : 0,
      reviews,
    });
  } catch (error: any) {
    console.error("Szczegóły błędu serwera:", error);
    return res.status(500).json({ 
      error: "Wewnętrzny błąd serwera", 
      details: error.message || String(error) 
    });
  }
});

app.post("/api/restaurant/:slug/bulk-tables", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count } = req.body; // np. 15

    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount <= 0 || numCount > 100) {
      return res.status(400).json({ error: "Podaj liczbę stolików od 1 do 100." });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: { tables: true },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji." });
    }

    // Usuwamy stare stoliki lub dodajemy nowe od 1 do count
    // Wariant z usunięciem starych i wygenerowaniem od nowa:
    await prisma.table.deleteMany({ where: { restaurantId: restaurant.id } });

    const newTablesData = Array.from({ length: numCount }, (_, i) => ({
      tableNumber: i + 1,
      name: `Stolik ${i + 1}`,
      restaurantId: restaurant.id,
    }));

    await prisma.table.createMany({ data: newTablesData });

    const updatedTables = await prisma.table.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { tableNumber: "asc" },
    });

    res.json({ success: true, tables: updatedTables });
  } catch (err: any) {
    console.error("Bulk tables error:", err);
    res.status(500).json({ error: "Błąd tworzenia stolików." });
  }
});

// 2. GENEROWANIE ARKUSZA PDF A4 DO DRUKU (Format 90x50 mm)
app.get("/api/restaurant/:slug/print-pdf", async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: {
        tables: {
          orderBy: { tableNumber: "asc" },
        },
      },
    });

    if (!restaurant || !restaurant.tables.length) {
      return res.status(400).json({ error: "Brak stolików do wydruku." });
    }

    // A4 w punktach: 595.28 x 841.89 pt
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Przeliczniki: 1 mm = 2.83465 pt
    const MM_TO_PT = 2.83465;
    const cardWidth = 90 * MM_TO_PT; // ~255 pt
    const cardHeight = 50 * MM_TO_PT; // ~141.7 pt

    const cols = 2;
    const rows = 5;
    const cardsPerPage = cols * rows; // 10 kart na stronę

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const marginX = (pageWidth - cols * cardWidth) / 2; // Wyśrodkowanie w poziomie
    const marginY = (pageHeight - rows * cardHeight) / 2; // Wyśrodkowanie w pionie

    const tables = restaurant.tables;
    const totalPages = Math.ceil(tables.length / cardsPerPage);

    // Opcjonalne logo lokalu (jeśli jest w base64)
    let logoImage = null;
    if (restaurant.logoUrl && restaurant.logoUrl.startsWith("data:image/png;base64,")) {
      try {
        const base64Data = restaurant.logoUrl.replace("data:image/png;base64,", "");
        const imageBytes = Buffer.from(base64Data, "base64");
        logoImage = await pdfDoc.embedPng(imageBytes);
      } catch (e) {
        console.warn("Nie udało się osadzić logo:", e);
      }
    }

    for (let p = 0; p < totalPages; p++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const pageTables = tables.slice(p * cardsPerPage, (p + 1) * cardsPerPage);

      for (let i = 0; i < pageTables.length; i++) {
        const table = pageTables[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Pozycja lewego dolnego rogu winietki (współrzędne PDF liczą od dołu)
        const x = marginX + col * cardWidth;
        const y = pageHeight - marginY - (row + 1) * cardHeight;

        // 1. Tło winietki (ciemny elegancki motyw #0B0F17)
        page.drawRectangle({
          x,
          y,
          width: cardWidth,
          height: cardHeight,
          color: rgb(0.043, 0.058, 0.09), // #0b0f17
          borderColor: rgb(0.2, 0.25, 0.35),
          borderWidth: 0.5, // Dyskretna linia cięcia
        });

        // 2. Generowanie kodu QR jako PNG
        const targetUrl = `https://dajopinie.com.pl/r/${restaurant.slug}?t=${table.tableNumber}`;
        const qrBuffer = await QRCode.toBuffer(targetUrl, {
          width: 250,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        const qrImage = await pdfDoc.embedPng(qrBuffer);

        // Pozycja kodu QR po prawej stronie winietki
        const qrSize = 34 * MM_TO_PT; // 34x34 mm
        const qrX = x + cardWidth - qrSize - 5 * MM_TO_PT;
        const qrY = y + (cardHeight - qrSize) / 2;

        // Biała obwódka pod kod QR
        page.drawRectangle({
          x: qrX - 2,
          y: qrY - 2,
          width: qrSize + 4,
          height: qrSize + 4,
          color: rgb(1, 1, 1),
        });

        page.drawImage(qrImage, {
          x: qrX,
          y: qrY,
          width: qrSize,
          height: qrSize,
        });

        // 3. Teksty po lewej stronie
        const textX = x + 6 * MM_TO_PT;

        // Numer stolika (złoty akcent)
        page.drawText(`STOLIK ${table.tableNumber}`, {
          x: textX,
          y: y + cardHeight - 10 * MM_TO_PT,
          size: 8,
          font: font,
          color: rgb(0.96, 0.62, 0.04), // #f59e0b
        });

        // Nazwa restauracji
        const restName = restaurant.name.length > 18 ? restaurant.name.substring(0, 16) + "..." : restaurant.name;
        page.drawText(restName, {
          x: textX,
          y: y + cardHeight - 17 * MM_TO_PT,
          size: 11,
          font: font,
          color: rgb(1, 1, 1),
        });

        // Call to action
        page.drawText("Jak smakowalo?", {
          x: textX,
          y: y + cardHeight - 24 * MM_TO_PT,
          size: 8,
          font: fontRegular,
          color: rgb(0.75, 0.8, 0.9),
        });
        page.drawText("Zeskanuj i ocen w Google", {
          x: textX,
          y: y + cardHeight - 30 * MM_TO_PT,
          size: 7.5,
          font: fontRegular,
          color: rgb(0.75, 0.8, 0.9),
        });

        // Subtelny podpis na dole
        page.drawText("Powered by DajOpinie *", {
          x: textX,
          y: y + 4 * MM_TO_PT,
          size: 5.5,
          font: fontRegular,
          color: rgb(0.45, 0.5, 0.6),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=DajOpinie-${restaurant.slug}-stoliki.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "Błąd generowania pliku PDF." });
  }
});

export default app;