import { useEffect, useState } from "react";
import { Check, Copy, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { downloadDataUrl, printStand, qrDataUrl, slugify } from "@/lib/qr";

interface QrPreviewDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label: string;
  url: string;
  restaurantName: string;
  logoUrl?: string | null;
}

export function QrPreviewDialog({
  open,
  onOpenChange,
  label,
  url,
  restaurantName,
  logoUrl,
}: QrPreviewDialogProps) {
  const [png, setPng] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setPng(null);
    qrDataUrl(url, 1024).then((d) => active && setPng(d));
    return () => {
      active = false;
    };
  }, [open, url]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link skopiowany");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Kod QR dla: {label}</DialogTitle>
          <DialogDescription className="text-xs">
            Podgląd stojaka, który stanie na Twoim stoliku w {restaurantName}.
          </DialogDescription>
        </DialogHeader>

        {/* KARTA PODGLĄDU STOJAKA 1:1 Z SZABLONEM DRUKU */}
        <div className="rounded-2xl border border-border/80 bg-slate-950 p-4">
          <div className="relative mx-auto flex max-w-[17.5rem] flex-col items-center justify-between gap-4 rounded-xl border border-[#f59e0b]/30 bg-gradient-to-b from-[#162238] to-[#0a0f1d] px-5 py-5 text-center shadow-2xl overflow-hidden">
            {/* Subtelna wewnętrzna ramka */}
            <div className="pointer-events-none absolute inset-1.5 rounded-lg border border-white/5" />

            {/* GÓRA: LOGO, GWIAZDKI I NAGŁÓWKI */}
            <div className="flex flex-col items-center z-10 w-full">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={restaurantName}
                  className="max-h-7 max-w-[130px] object-contain mb-1.5"
                />
              ) : (
                <p className="text-sm font-extrabold uppercase tracking-wider text-white mb-1">
                  {restaurantName}
                </p>
              )}

              <div className="text-[#f59e0b] text-xs tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] mb-1">
                ★★★★★
              </div>

              <p className="text-sm font-extrabold text-white leading-tight">
                Smakowało? <span className="text-[#f59e0b]">Oceń nas!</span>
              </p>
              <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                Twoja opinia pomaga nam się rozwijać
              </p>
            </div>

            {/* ŚRODEK: KOD QR ZE ZŁOTYMI NAROŻNIKAMI CELOWNIKA */}
            <div className="relative p-2.5 z-10">
              <div className="absolute top-0 left-0 size-3.5 border-t-2 border-l-2 border-[#f59e0b] rounded-tl-[3px]" />
              <div className="absolute top-0 right-0 size-3.5 border-t-2 border-r-2 border-[#f59e0b] rounded-tr-[3px]" />
              <div className="absolute bottom-0 left-0 size-3.5 border-b-2 border-l-2 border-[#f59e0b] rounded-bl-[3px]" />
              <div className="absolute bottom-0 right-0 size-3.5 border-b-2 border-r-2 border-[#f59e0b] rounded-br-[3px]" />

              <div className="grid size-32 place-items-center overflow-hidden rounded-xl bg-white p-2 shadow-2xl">
                {png ? (
                  <img
                    src={png}
                    alt={`Kod QR — ${label}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                )}
              </div>
            </div>

            {/* DÓŁ: MIKRO-INSTRUKCJA I STOPKA */}
            <div className="z-10 w-full space-y-1">
              <p className="text-[10px] font-bold text-slate-200">
                📱 Zeskanuj aparatem telefonu
              </p>
              <p className="text-[9px] text-slate-400">
                Zajmie Ci to tylko 5 sekund · Bez rejestracji
              </p>
              <p className="pt-1 text-[8.5px] text-slate-400/80">
                Powered by <strong className="text-white">Daj<span className="text-[#f59e0b]">Opinie</span></strong> ★
              </p>
            </div>
          </div>
        </div>

        {/* INPUT Z LINKIEM */}
        <div className="flex items-center gap-2">
          <Input readOnly value={url} className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copy} aria-label="Kopiuj link">
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
          </Button>
        </div>

        {/* PRZYCISKI AKCJI */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 font-semibold glow-gold text-xs"
            disabled={!png}
            onClick={() => {
              if (!png) return;
              downloadDataUrl(png, `qr-${slugify(label)}.png`);
              toast.success("Pobrano QR w wysokiej jakości");
            }}
          >
            <Download className="size-3.5 mr-1" />
            Pobierz QR
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-xs"
            disabled={!png}
            onClick={() => {
              if (!png) return;
              const ok = printStand(label, restaurantName, png, logoUrl);
              if (!ok) toast.error("Zezwól na wyskakujące okna, aby wydrukować stojak");
            }}
          >
            <FileText className="size-3.5 mr-1" />
            Drukuj stojak PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}