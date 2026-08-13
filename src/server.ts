import "dotenv/config";
import express from "express";
import { db } from "./lib/db";
import cors from "cors";
import bcrypt from "bcryptjs";

const app = express();
app.use(cors());
app.use(express.json());

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

// Login
app.post("/api/auth/register", async (req, res) => {
  try {
    const { restaurantName, email, password } = req.body;

    if (!restaurantName || !email || !password) {
      return res.status(400).json({ error: "Wypełnij wszystkie pola!" });
    }

    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Konto o podanym adresie e-mail już istnieje!" });
    }

    // Haszowanie hasła
    const password_hash = await bcrypt.hash(password, 10);

    // Wyliczenie daty końca trialu (+14 dni)
    const now = new Date();
    const trialEnds = new Date(now);
    trialEnds.setDate(now.getDate() + 14);

    let baseSlug = slugify(restaurantName);
    let slug = baseSlug;
    let counter = 1;

    // Zapewnienie unikalności sluga
    while (await db.restaurants.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Tworzenie użytkownika, restauracji oraz pierwszego kodu QR w jednej transakcji
    const result = await db.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          email,
          password_hash,
        },
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

      // Tworzenie pierwszego kodu QR dla Stolika #01
      await tx.qr_codes.create({
        data: {
          restaurant_id: newRestaurant.id,
          label: "Stolik #01",
          code_identifier: `${slug}-stolik01`,
        },
      });

      return { user: newUser, restaurant: newRestaurant };
    });

    return res.json({
      success: true,
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

    return res.json({
      success: true,
      user: { id: user.id, email: user.email },
      restaurantSlug: firstRestaurant?.slug || "pizzeria-la-torre",
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    return res.status(500).json({ error: "Błąd serwera podczas logowania" });
  }
});

// 1. DASHBOARD DATA
app.get("/api/dashboard/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await db.restaurants.findUnique({
      where: { slug },
      include: {
        qr_codes: {
          include: {
            analytics_events: true,
          },
        },
      },
    });

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

      return {
        date: dayLabel,
        skany: scansOnDay,
        scans: scansOnDay,
      };
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
      googleReviewLink: restaurant.google_review_link,
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

// 2. AKTUALIZACJA LINKU GOOGLE
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

// 3. REJESTRACJA SKANU QR
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
      logoUrl: qrCode.restaurant.logo_url, // 👈 Przekazujemy adres logo
      tableLabel: qrCode.label,
      googleReviewLink: qrCode.restaurant.google_review_link,
    });
  } catch (error) {
    console.error("Błąd podczas rejestracji skanu:", error);
    return res.status(500).json({ error: "Błąd serwera" });
  }
});

// 4. REJESTRACJA KLIKNIĘCIA
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
app.listen(PORT, () => console.log(`🚀 API Express nasłuchuje na porcie ${PORT}`));