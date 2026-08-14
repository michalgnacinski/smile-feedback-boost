import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "DajOpinie <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL || "http://localhost:8080";
const STRIPE_LINK = "https://buy.stripe.com/5kQ5kD12h8pm8eE17c3Je00";

// Szablon bazowy HTML (ciemny motyw z bursztynowo-złotymi akcentami DajOpinie)
function getEmailLayout(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0b0f17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
        .container { max-width: 580px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .logo { font-size: 24px; font-weight: 800; color: #ffffff; text-decoration: none; margin-bottom: 24px; display: inline-block; }
        .logo span { color: #f59e0b; }
        .btn { display: inline-block; background-color: #f59e0b; color: #020617 !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-top: 24px; font-size: 15px; }
        .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 32px; line-height: 1.6; }
        h1 { font-size: 22px; font-weight: 800; margin-top: 0; color: #ffffff; line-height: 1.3; }
        p { font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 12px 0; }
        .highlight-box { background-color: #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <a href="${APP_URL}" class="logo">Daj<span>Opinie</span></a>
          ${content}
        </div>
        <div class="footer">
          <p>Wiadomość wygenerowana automatycznie przez system <strong>DajOpinie</strong>.<br>
          Potrzebujesz pomocy? Napisz do nas na <a href="mailto:kontakt@dajopinie.pl" style="color:#f59e0b; text-decoration:none;">kontakt@dajopinie.pl</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 1. E-MAIL POWITALNY (Wysyłany od razu po rejestracji)
export async function sendWelcomeEmail(to: string, restaurantName: string, slug: string) {
  if (!resend) {
    console.log(`[Resend MOCK] E-mail powitalny dla ${to} (${restaurantName})`);
    return;
  }

  const content = `
    <h1>Witaj w DajOpinie! 🚀</h1>
    <p>Cieszymy się, że jesteś z nami. Twój lokal <strong>${restaurantName}</strong> został pomyślnie utworzony. Rozpocząłeś właśnie <strong>14-dniowy bezpłatny okres próbny</strong>.</p>
    
    <div class="highlight-box">
      <strong style="color:#ffffff; font-size: 14px; display:block; margin-bottom:8px;">🎯 2 szybkie kroki do pierwszych opinii:</strong>
      <ol style="color:#cbd5e1; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>Wklej link do wizytówki Google Maps w zakładce <em>Profil & Google Link</em>.</li>
        <li>Pobierz i wydrukuj gotowe kody QR dla stolików z zakładki <em>Kody QR i Stojaki</em>.</li>
      </ol>
    </div>

    <p>Możesz zalogować się do swojego panelu w dowolnym momencie, aby zarządzać stojakami i śledzić statystyki skanów na żywo:</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="btn">Otwórz Panel Menadżera →</a>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Witaj w DajOpinie — Twój lokal ${restaurantName} jest gotowy!`,
      html: getEmailLayout("Witaj w DajOpinie", content),
    });

    if (error) {
      console.error("❌ Błąd Resend przy mailu powitalnym:", error);
    } else {
      console.log(`✅ [Resend] Wysłano e-mail powitalny do ${to} (ID: ${data?.id})`);
    }
  } catch (err) {
    console.error("❌ Błąd wysyłki e-maila powitalnego:", err);
  }
}

// 2. E-MAIL: PRZYPOMNIENIE O KOŃCU TRIALU (np. 3 dni przed wygaśnięciem)
export async function sendTrialEndingEmail(
  to: string,
  restaurantName: string,
  daysLeft: number,
  totalScans: number
) {
  if (!resend) {
    console.log(`[Resend MOCK] Alert o końcu trialu dla ${to}`);
    return;
  }

  const content = `
    <h1>Zbliża się koniec okresu próbnego ⏳</h1>
    <p>Twój 14-dniowy test w systemie DajOpinie dla lokalu <strong>${restaurantName}</strong> dobiega końca za <strong>${daysLeft} dni</strong>.</p>
    
    <div class="highlight-box">
      <p style="margin: 0; color:#ffffff; font-size: 14px;">
        📊 W czasie trwania testu Twoje kody QR zostały zeskanowane <strong>${totalScans} razy</strong>!
      </p>
    </div>

    <p>Aby zachować ciągłość działania kodów na stolikach i nie przerywać napływu 5-gwiazdkowych opinii, aktywuj subskrypcję już teraz:</p>
    
    <div style="text-align: center;">
      <a href="${STRIPE_LINK}" class="btn">Aktywuj subskrypcję (99 PLN / msc) →</a>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Ważne: Zostało ${daysLeft} dni okresu próbnego dla ${restaurantName}`,
      html: getEmailLayout("Koniec okresu próbnego", content),
    });

    if (error) {
      console.error("❌ Błąd Resend przy mailu o trialu:", error);
    } else {
      console.log(`✅ [Resend] Wysłano alert o końcu trialu do ${to} (ID: ${data?.id})`);
    }
  } catch (err) {
    console.error("❌ Błąd wysyłki alertu o trialu:", err);
  }
}

// 3. E-MAIL: OSIĄGNIĘCIE PROGU SKANÓW (Milestone Alert: 25, 50, 100 skanów)
export async function sendMilestoneEmail(
  to: string,
  restaurantName: string,
  milestoneCount: number
) {
  if (!resend) {
    console.log(`[Resend MOCK] Alert o progu skanów (${milestoneCount}) dla ${to}`);
    return;
  }

  const content = `
    <h1>Świetny wynik! Pierwsze ${milestoneCount} skanów 🏆</h1>
    <p>Goście w Twoim lokalu <strong>${restaurantName}</strong> zeskanowali kody QR już ponad <strong>${milestoneCount} razy</strong>!</p>
    <p>To dowód, że goście chętnie wchodzą w interakcję ze stojakami na stolikach, a Twoja wizytówka Google zyskuje nowe, wartościowe oceny.</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="btn">Zobacz wykres w panelu →</a>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 Gratulacje! Twój lokal ${restaurantName} osiągnął ${milestoneCount} skanów!`,
      html: getEmailLayout("Kamień milowy skanów", content),
    });

    if (error) {
      console.error("❌ Błąd Resend przy kamieniu milowym:", error);
    } else {
      console.log(`✅ [Resend] Wysłano mail o ${milestoneCount} skanach do ${to} (ID: ${data?.id})`);
    }
  } catch (err) {
    console.error("❌ Błąd wysyłki powiadomienia o skanach:", err);
  }
}