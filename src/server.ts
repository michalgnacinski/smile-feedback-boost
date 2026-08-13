import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "./lib/db";

const app = express();
app.use(cors());
app.use(express.json());

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
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-|-$/g, "");
}

// 1. REJESTRACJA UŻYTKOWNIKA I RESTAURACJI
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

    // Wygenerowanie tokenu sesji
    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      token,
      user: { id: result.user.id, email: result.user.email },
      restaurantSlug: result.restaurant.slug,
    });
  } catch (error) {
    console.error("Błąd podczas rejestracji:", error);
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
      restaurantSlug: firstRestaurant?.slug || "pizzeria-la-torre",
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    return res.status(500).json({ error: "Błąd serwera podczas logowania" });
  }
});

// 3. DANE DASHBOARDU (Rozpoznaje zalogowanego użytkownika po tokenie)
app.get("/api/dashboard", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // Token wygasł lub jest nieprawidłowy
      }
    }

    let userRestaurants = userId
      ? await db.restaurants.findMany({ where: { user_id: userId } })
      : [];

    let restaurant;

    if (userRestaurants.length > 0) {
      // Wybieramy restaurację na podstawie parametru slug z query (lub pierwszą z listy)
      const requestedSlug = req.query.slug as string;
      restaurant =
        userRestaurants.find((r) => r.slug === requestedSlug) || userRestaurants[0];

      // Dociągamy szczegóły wybranej restauracji (kody QR, zdarzenia)
      restaurant = await db.restaurants.findUnique({
        where: { id: restaurant.id },
        include: {
          qr_codes: {
            include: { analytics_events: true },
          },
        },
      });
    } else {
      // Domyślny fallback, gdy brak zalogowanego użytkownika
      restaurant = await db.restaurants.findFirst({
        include: {
          qr_codes: {
            include: { analytics_events: true },
          },
        },
      });
    }

    // Fallback: jeśli brak tokenu, pobierzmy pierwszą restaurację z bazy
    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji" });
    }

    const now = new Date();
    const trialEnds = new Date(restaurant.trial_ends_at);
    const diffTime = trialEnds.getTime() - now.getTime();
    const trialDaysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const allEvents = restaurant.qr_codes.flatMap((qr) => qr.analytics_events);
    const totalScans = allEvents.filter((e) => e.event_type === "SCAN").length;
    const totalClicks = allEvents.filter((e) => e.event_type === "CLICK").length;
    const conversionRate =
      totalScans > 0 ? ((totalClicks / totalScans) * 100).toFixed(1) : "0";

    const last14Days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      const scansOnDay = allEvents.filter(
        (e) =>
          e.event_type === "SCAN" &&
          new Date(e.created_at).toISOString().split("T")[0] === dateStr
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
        url: `https://dajopinie.pl/r/${qr.code_identifier}`,
      };
    });

    return res.json({
      restaurantName: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logo_url,
      googleReviewLink: restaurant.google_review_link,
      // 👈 Przekazujemy listę tylko tych lokali, które należą do zalogowanego konta:
      userRestaurants: userRestaurants.map((r) => ({
        name: r.name,
        slug: r.slug,
        logoUrl: r.logo_url,
      })),
      subscription: {
        status: restaurant.subscription_status,
        trialDaysLeft,
        trialEndsAt: restaurant.trial_ends_at,
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
    console.error("❌ Błąd serwera API:", error);
    return res.status(500).json({ error: "Błąd serwera bazy danych" });
  }
});

// AKTUALIZACJA LINKU GOOGLE
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
    console.error("Błąd podczas aktualizacji linku:", error);
    return res.status(500).json({ error: "Błąd serwera przy zapisie linku" });
  }
});

// REJESTRACJA SKANU QR
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

    return res.json({
      qrCodeId: qrCode.id,
      restaurantName: qrCode.restaurant.name,
      logoUrl: qrCode.restaurant.logo_url,
      tableLabel: qrCode.label,
      googleReviewLink: qrCode.restaurant.google_review_link,
    });
  } catch (error) {
    console.error("Błąd podczas rejestracji skanu:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// REJESTRACJA KLIKNIĘCIA
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
    console.error("Błąd podczas rejestracji kliknięcia:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});
const PORT = process.env.PORT || 3001;

// TWORZENIE NOWEGO STOLIKA / KODU QR
app.post("/api/qr-codes", async (req, res) => {
  try {
    const { restaurantSlug, label } = req.body;

    if (!restaurantSlug || !label) {
      return res.status(400).json({ error: "Podaj nazwę stolika" });
    }

    const restaurant = await db.restaurants.findUnique({
      where: { slug: restaurantSlug },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji" });
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
        url: `https://dajopinie.pl/r/${newQr.code_identifier}`,
      },
    });
  } catch (error) {
    console.error("Błąd podczas dodawania stolika:", error);
    return res.status(500).json({ error: "Błąd serwera przy dodawaniu stolika" });
  }
});

// USUWANIE STOLIKA / KODU QR
app.delete("/api/qr-codes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.qr_codes.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Błąd podczas usuwania stolika:", error);
    return res.status(500).json({ error: "Błąd serwera przy usuwaniu stolika" });
  }
});

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
    console.error("Błąd podczas zapisu logo:", error);
    return res.status(500).json({ error: "Błąd serwera przy zapisie logo" });
  }
});

app.listen(PORT, () => console.log(`🚀 API Express nasłuchuje na porcie ${PORT}`));

