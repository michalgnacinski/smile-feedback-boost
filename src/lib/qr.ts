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
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#0F172A", light: "#FFFFFF" },
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
  @page { size: A5; margin: 0 }
  *{box-sizing:border-box}
  body{margin:0;font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;background:#fff}
  .card{width:148mm;height:210mm;padding:16mm 12mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center;color:#0F172A}
  h1{font-size:26pt;margin:0;letter-spacing:-.02em}
  h2{font-size:15pt;margin:6mm 0 0;font-weight:600;color:#334155}
  img{width:78mm;height:78mm;border:2mm solid #F59E0B;border-radius:6mm}
  .tag{font-size:9pt;color:#64748B}
  .label{font-size:12pt;font-weight:700;color:#F59E0B;letter-spacing:.08em;text-transform:uppercase}
</style></head><body onload="window.print()">
<div class="card">
  <div><h1>${restaurantName}</h1><h2>Jak podobała Ci się wizyta?<br/>Podziel się swoją opinią</h2></div>
  <img src="${dataUrl}" alt="Kod QR ${label}" />
  <div><div class="label">${label}</div><div class="tag">Powered by DajOpinie</div></div>
</div></body></html>`);
  w.document.close();
  return true;
}
