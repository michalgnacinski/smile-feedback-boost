import QRCode from "qrcode";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface TableItemForZip {
  label: string;
  url?: string;
  codeIdentifier?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
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

export function tableUrl(slug: string, identifier: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
  return `${origin}/r/${identifier}`;
}

export async function qrDataUrl(text: string, size = 512): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// POBIERANIE WSZYSTKICH KODÓW QR W PLIKU ZIP
export async function downloadAllQrsAsZip(tables: TableItemForZip[], restaurantName: string) {
  const zip = new JSZip();
  const folder = zip.folder(`kody-qr-${slugify(restaurantName)}`) || zip;

  for (const table of tables) {
    const targetUrl = table.url || tableUrl(slugify(restaurantName), table.codeIdentifier || slugify(table.label));
    const base64Data = await qrDataUrl(targetUrl, 1024);
    const cleanBase64 = base64Data.replace(/^data:image\/png;base64,/, "");
    folder.file(`kod-qr-${slugify(table.label)}.png`, cleanBase64, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `kody-qr-${slugify(restaurantName)}.zip`);
}

export function printStand(
  label: string,
  restaurantName: string,
  qrDataUrlStr: string,
  logoUrl?: string | null
): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;

  const topLogoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${restaurantName}" class="restaurant-logo" />`
    : `<div class="logo-placeholder">${restaurantName}</div>`;

  w.document.write(`
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="utf-8">
      <title>Stojak QR — ${restaurantName}</title>
      <style>
        @page {
          size: A6 portrait;
          margin: 0;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* GŁÓWNA KARTA STOJAKA A6 */
        .stand-card {
          width: 105mm;
          height: 148mm;
          background: radial-gradient(circle at 50% 15%, #162238 0%, #0a0f1d 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 10mm 8mm 7mm 8mm;
          text-align: center;
          color: #ffffff;
          position: relative;
          border: 1.5px solid rgba(245, 158, 11, 0.25);
        }

        /* WEWNĘTRZNA SUBTELNA RAMKA */
        .inner-border {
          position: absolute;
          inset: 3mm;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 6px;
          pointer-events: none;
        }

        .header-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .restaurant-logo {
          max-height: 32px;
          max-width: 130px;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .logo-placeholder {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #ffffff;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        /* ZŁOTE GWIAZDKI */
        .stars-row {
          color: #f59e0b;
          font-size: 14px;
          letter-spacing: 3px;
          margin-bottom: 6px;
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }

        .cta-heading {
          font-size: 16px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.2px;
          line-height: 1.2;
        }
        
        .cta-heading span {
          color: #f59e0b;
        }

        .cta-sub {
          font-size: 11px;
          color: #94a3b8;
          margin: 4px 0 0 0;
        }

        /* CELOWNIK KODU QR */
        .qr-target-box {
          position: relative;
          padding: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 4px 0;
          z-index: 1;
        }

        .qr-target-box img {
          display: block;
          width: 46mm;
          height: 46mm;
          border-radius: 12px;
          background: #ffffff;
          padding: 6px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: #f59e0b;
          border-style: solid;
        }
        .corner-tl { top: 0; left: 0; border-width: 3.5px 0 0 3.5px; border-top-left-radius: 6px; }
        .corner-tr { top: 0; right: 0; border-width: 3.5px 3.5px 0 0; border-top-right-radius: 6px; }
        .corner-bl { bottom: 0; left: 0; border-width: 0 0 3.5px 3.5px; border-bottom-left-radius: 6px; }
        .corner-br { bottom: 0; right: 0; border-width: 0 3.5px 3.5px 0; border-bottom-right-radius: 6px; }

        /* MIKRO-INSTRUKCJA */
        .instruction-box {
          z-index: 1;
        }

        .instruction-title {
          font-size: 11px;
          font-weight: 700;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .instruction-sub {
          font-size: 9.5px;
          color: #64748b;
          margin-top: 2px;
        }

        /* STOPKA */
        .footer-brand {
          font-size: 9px;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          z-index: 1;
          margin-top: 2px;
        }
      </style>
    </head>
    <body>
      <div class="stand-card">
        <div class="inner-border"></div>

        <!-- GÓRA: LOGO, GWIAZDKI, NAGŁÓWEK -->
        <div class="header-section">
          ${topLogoHtml}
          <div class="stars-row">★★★★★</div>
          <div class="cta-heading">Smakowało? <span>Oceń nas!</span></div>
          <div class="cta-sub">Twoja opinia pomaga nam się rozwijać</div>
        </div>

        <!-- ŚRODEK: KOD QR ZE ZŁOTYM CELOWNIKIEM -->
        <div class="qr-target-box">
          <div class="corner corner-tl"></div>
          <div class="corner corner-tr"></div>
          <div class="corner corner-bl"></div>
          <div class="corner corner-br"></div>
          <img src="${qrDataUrlStr}" alt="Kod QR do opinii Google" />
        </div>

        <!-- DÓŁ: INSTRUKCJA SKANOWANIA + DYSKRETNA MARKA -->
        <div class="instruction-box">
          <div class="instruction-title">
            📱 Zeskanuj aparatem telefonu
          </div>
          <div class="instruction-sub">Zajmie Ci to tylko 5 sekund · Bez rejestracji</div>
          
          <div class="footer-brand">
            Powered by <strong style="color:#ffffff;">Daj<span style="color:#f59e0b;">Opinie</span></strong> ★
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `);
  w.document.close();
  return true;
}