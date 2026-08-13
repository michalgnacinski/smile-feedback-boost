export const SITE_ORIGIN = "https://dajopinie.pl";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[ąàáâä]/g, "a")
    .replace(/[ćç]/g, "c")
    .replace(/[ę èéêë]/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/[óòôö]/g, "o")
    .replace(/[śş]/g, "s")
    .replace(/[żź]/g, "z")
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-|-$/g, "");
}

export function tableUrl(restaurantSlug: string, label: string) {
  return `${SITE_ORIGIN}/r/${restaurantSlug}-${slugify(label)}`;
}

/** Generates a QR code as a PNG data URL (browser only). */
export async function qrDataUrl(text: string, size = 512) {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "H",
    color: { dark: "#0B132A", light: "#FFFFFF" },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Opens a print-ready A5 stand template in a new window (print → save as PDF). */
export function printStand(label: string, restaurantName: string, dataUrl: string) {
  const w = window.open("", "_blank", "width=760,height=980");
  if (!w) return false;

  w.document.write(`<!doctype html><html lang="pl"><head><meta charset="utf-8">
<title>Stojak QR — ${label}</title>
<style>
  @page {
    size: A5;
    margin: 0;
  }
  
  /* KLUCZ: Wymuszenie drukowania tła i kolorów w przeglądarkach */
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    width: 148mm;
    height: 210mm;
    background-color: #0B132A !important;
    color: #FFFFFF !important;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .card {
    width: 148mm;
    height: 210mm;
    padding: 22mm 16mm 18mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    text-align: center;
    background-color: #0B132A !important;
    position: relative;
  }
  
  .logo {
    font-size: 20pt;
    font-weight: 700;
    color: #FFFFFF !important;
    letter-spacing: -.01em;
    margin-bottom: 8mm;
  }
  
  .title {
    font-size: 19pt;
    font-weight: 700;
    color: #F59E0B !important;
    margin: 0 0 3mm;
    line-height: 1.25;
  }
  
  .subtitle {
    font-size: 12pt;
    color: #E2E8F0 !important;
    margin: 0;
    font-weight: 400;
    letter-spacing: .01em;
  }
  
  /* Kontener QR ze złotymi narożnikami */
  .qr-frame {
    position: relative;
    padding: 12px;
    margin: 4mm 0;
  }
  
  .corner {
    position: absolute;
    width: 24px;
    height: 24px;
    border-color: #F59E0B !important;
    border-style: solid;
  }
  .corner-tl { top:0; left:0; border-width: 4px 0 0 4px; }
  .corner-tr { top:0; right:0; border-width: 4px 4px 0 0; }
  .corner-bl { bottom:0; left:0; border-width: 0 0 4px 4px; }
  .corner-br { bottom:0; right:0; border-width: 0 4px 4px 0; }
  
  .qr-img {
    width: 68mm;
    height: 68mm;
    display: block;
    border-radius: 6px;
    background: #FFFFFF !important;
    padding: 8px;
  }
  
  .table-label {
    font-size: 11pt;
    font-weight: 600;
    color: #E2E8F0 !important;
    letter-spacing: .05em;
    text-transform: uppercase;
    margin-bottom: 2mm;
  }
  
  .footer {
    font-size: 10pt;
    color: #94A3B8 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 500;
  }
  
  .star {
    color: #F59E0B !important;
    font-size: 12pt;
  }
</style></head><body onload="window.print()">
<div class="card">
  <div>
    <div class="logo">${restaurantName}</div>
    <div class="title">Jak podobała Ci się wizyta?</div>
    <div class="subtitle">Podziel się swoją opinią</div>
  </div>
  
  <div class="qr-frame">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <img class="qr-img" src="${dataUrl}" alt="Kod QR ${label}" />
  </div>
  
  <div>
    <div class="table-label">${label}</div>
    <div class="footer">Powered by DajOpinie <span class="star">★</span></div>
  </div>
</div></body></html>`);

  w.document.close();
  return true;
}