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
const APP_URL = process.env.APP_URL || "https://dajopinie.com.pl";

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
          code_identifier: `${slug}-stolik-01`,
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
          qr_codes: { include: { analytics_events: true }, orderBy: { created_at: "asc" } },
        },
      });
    } else {
      restaurant = await db.restaurants.findFirst({
        include: {
          qr_codes: { include: { analytics_events: true }, orderBy: { created_at: "asc" } },
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

// 10. HURTOWE GENEROWANIE STOLIKÓW
app.post("/api/restaurant/:slug/bulk-tables", async (req, res) => {
  try {
    const { slug } = req.params;
    const { count } = req.body;

    const numCount = parseInt(count, 10);
    if (isNaN(numCount) || numCount <= 0 || numCount > 100) {
      return res.status(400).json({ error: "Podaj liczbę od 1 do 100." });
    }

    const restaurant = await db.restaurants.findUnique({
      where: { slug },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Nie znaleziono restauracji." });
    }

    // Usuwamy stare kody QR
    await db.qr_codes.deleteMany({
      where: { restaurant_id: restaurant.id },
    });

    // Tworzymy nowe kody stolików
    const qrData = Array.from({ length: numCount }, (_, i) => {
      const tableNum = i + 1;
      const formattedNum = tableNum < 10 ? `0${tableNum}` : `${tableNum}`;
      return {
        label: `Stolik #${formattedNum}`,
        code_identifier: `${restaurant.slug}-stolik-${formattedNum}`,
        restaurant_id: restaurant.id,
      };
    });

    await db.qr_codes.createMany({
      data: qrData,
    });

    const tables = await db.qr_codes.findMany({
      where: { restaurant_id: restaurant.id },
      orderBy: { created_at: "asc" },
    });

    return res.json({ success: true, tables });
  } catch (err: any) {
    console.error("Bulk tables error:", err);
    return res.status(500).json({ error: err.message || "Błąd generowania stolików." });
  }
});

// 11. GENEROWANIE ARKUSZA PDF A4 (Format 90x50 mm)
// 11. GENEROWANIE ARKUSZA PDF A4 (Format 90x50 mm - Wersja PREMIUM)
app.get("/api/restaurant/:slug/print-pdf", async (req, res) => {
  try {
    const { slug } = req.params;

    const restaurant = await db.restaurants.findUnique({
      where: { slug },
      include: {
        qr_codes: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!restaurant || !restaurant.qr_codes || restaurant.qr_codes.length === 0) {
      return res.status(400).json({ error: "Brak stolikow do wydruku." });
    }

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let logoImage: any = null;
    let logoDims = { width: 0, height: 0 };
    const MM_TO_PT = 2.83465;

    if (restaurant.logo_url) {
      try {
        const isJpeg =
          restaurant.logo_url.includes("image/jpeg") ||
          restaurant.logo_url.includes("image/jpg");
        const base64Data = restaurant.logo_url.replace(/^data:image\/\w+;base64,/, "");
        const imageBytes = Buffer.from(base64Data, "base64");

        if (isJpeg) {
          logoImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          logoImage = await pdfDoc.embedPng(imageBytes);
        }

        logoDims = logoImage.scaleToFit(38 * MM_TO_PT, 14 * MM_TO_PT);
      } catch (e) {
        console.warn("Nie udalo sie osadzic logo:", e);
      }
    }

    const cardWidth = 90 * MM_TO_PT;
    const cardHeight = 50 * MM_TO_PT;
    const cols = 2;
    const rows = 5;
    const cardsPerPage = cols * rows;

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = (pageWidth - cols * cardWidth) / 2;
    const marginY = (pageHeight - rows * cardHeight) / 2;

    const tables = restaurant.qr_codes;
    const totalPages = Math.ceil(tables.length / cardsPerPage);

    // Wektorowa definicja gwiazdki bezpieczna dla wszystkich wersji pdf-lib
    const starSvg = "M 10 0 L 13 7 L 20 7 L 15 12 L 17 19 L 10 15 L 3 19 L 5 12 L 0 7 L 7 7 Z";

    for (let p = 0; p < totalPages; p++) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const pageTables = tables.slice(p * cardsPerPage, (p + 1) * cardsPerPage);

      for (let i = 0; i < pageTables.length; i++) {
        const table = pageTables[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = marginX + col * cardWidth;
        const y = pageHeight - marginY - (row + 1) * cardHeight;

        // 1. Tło gradientowe
        const gradientSteps = 30;
        for (let s = 0; s < gradientSteps; s++) {
          const ratio = s / gradientSteps;
          page.drawRectangle({
            x,
            y: y + cardHeight - (cardHeight / gradientSteps) * (s + 1),
            width: cardWidth,
            height: cardHeight / gradientSteps + 1.2,
            color: rgb(
              0.117 + (0.043 - 0.117) * ratio,
              0.160 + (0.058 - 0.160) * ratio,
              0.231 + (0.090 - 0.231) * ratio
            ),
          });
        }

        // Linie cięcia + złoty pasek u góry
        page.drawRectangle({
          x,
          y,
          width: cardWidth,
          height: cardHeight,
          borderColor: rgb(0.3, 0.35, 0.45),
          borderWidth: 0.5,
        });

        page.drawRectangle({
          x,
          y: y + cardHeight - 1.5,
          width: cardWidth,
          height: 1.5,
          color: rgb(0.96, 0.62, 0.04),
        });

        // 2. Generowanie kodu QR
        const targetUrl = `https://dajopinie.com.pl/r/${table.code_identifier}`;
        const qrBuffer = await QRCode.toBuffer(targetUrl, {
          width: 260,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
        });
        const qrImage = await pdfDoc.embedPng(qrBuffer);

        const qrSize = 34 * MM_TO_PT;
        const qrX = x + cardWidth - qrSize - 6 * MM_TO_PT;
        const qrY = y + (cardHeight - qrSize) / 2;

        page.drawRectangle({
          x: qrX - 2,
          y: qrY - 2,
          width: qrSize + 4,
          height: qrSize + 4,
          color: rgb(1, 1, 1),
        });
        page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

        // 3. Lewa strona (Logo, Gwiazdki, Tekst)
        const textX = x + 6 * MM_TO_PT;
        let currentY = y + cardHeight - 5 * MM_TO_PT;

        if (logoImage) {
          currentY -= logoDims.height;
          page.drawImage(logoImage, {
            x: textX,
            y: currentY,
            width: logoDims.width,
            height: logoDims.height,
          });
        } else {
          currentY -= 6 * MM_TO_PT;
          const cleanName = (restaurant.name || "Restauracja")
            .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "a");
          const restName = cleanName.length > 18 ? cleanName.substring(0, 16) + "..." : cleanName;
          page.drawText(restName, { x: textX, y: currentY, size: 11, font: fontBold, color: rgb(1, 1, 1) });
        }

        // 5 Złotych Gwiazdek
        currentY -= 8 * MM_TO_PT;
        const starSvg = "M 10 0 L 13 7 L 20 7 L 15 12 L 17 19 L 10 15 L 3 19 L 5 12 L 0 7 L 7 7 Z";
        for (let star = 0; star < 5; star++) {
          page.drawSvgPath(starSvg, {
            x: textX + star * 19, // Zwiększony odstęp między gwiazdkami
            y: currentY + 12,
            scale: 0.75,         // Lekko zmniejszona skala, aby gwiazdki nie zlewały się ze sobą
            color: rgb(0.96, 0.62, 0.04),
          });
        }

        // Teksty
        currentY -= 7 * MM_TO_PT;
        page.drawText("Jak smakowalo?", {
          x: textX,
          y: currentY,
          size: 9.5,
          font: fontBold,
          color: rgb(1, 1, 1),
        });

        currentY -= 4.5 * MM_TO_PT;
        page.drawText("Zeskanuj i ocen w Google", {
          x: textX,
          y: currentY,
          size: 7.5,
          font: fontRegular,
          color: rgb(0.7, 0.75, 0.85),
        });

        // 4. Bezpieczna etykieta stolika (z fallbackiem, bez ryzyka undefined.toUpperCase)
        const safeLabel = String(table.label || `Stolik #${i + 1}`).toUpperCase();
        page.drawText(safeLabel, {
          x: textX,
          y: y + 4 * MM_TO_PT,
          size: 5.5,
          font: fontBold,
          color: rgb(0.45, 0.5, 0.6),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=DajOpinie-${restaurant.slug}-winietki.pdf`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("PDF generation error:", err);
    return res.status(500).json({ error: err.message || "Blad generowania pliku PDF." });
  }
});

export default app;