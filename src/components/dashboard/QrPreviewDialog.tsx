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

export function QrPreviewDialog({
  open,
  onOpenChange,
  label,
  url,
  restaurantName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  label: string;
  url: string;
  restaurantName: string;
}) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kod QR dla: {label}</DialogTitle>
          <DialogDescription>
            Podgląd stojaka, który stanie na Twoim stoliku w {restaurantName}.
          </DialogDescription>
        </DialogHeader>

        {/* KARTA PODGLĄDU STOJANIA 1:1 Z MOJEGO STOLIKA */}
        <div className="rounded-2xl border border-border bg-slate-950 p-4">
          <div className="mx-auto flex max-w-[17rem] flex-col items-center justify-between gap-5 rounded-xl bg-[#0B132A] px-5 py-6 text-center shadow-2xl border border-slate-800/80">
            {/* GÓRA: LOGO I NAGŁÓWKI */}
            <div>
              <p className="text-base font-bold text-white tracking-tight">
                {restaurantName}
              </p>
              <p className="mt-3 text-sm font-bold text-[#F59E0B] leading-tight">
                Jak podobała Ci się wizyta?
              </p>
              <p className="mt-1.5 text-xs text-slate-300 font-normal">
                Podziel się swoją opinią
              </p>
            </div>

            {/* ŚRODEK: KOD QR ZE ZŁOTYMI NAROŻNIKAMI */}
            <div className="relative p-2.5">
              {/* Narożniki akcentowe */}
              <div className="absolute top-0 left-0 size-4 border-t-2 border-l-2 border-[#F59E0B]" />
              <div className="absolute top-0 right-0 size-4 border-t-2 border-r-2 border-[#F59E0B]" />
              <div className="absolute bottom-0 left-0 size-4 border-b-2 border-l-2 border-[#F59E0B]" />
              <div className="absolute bottom-0 right-0 size-4 border-b-2 border-r-2 border-[#F59E0B]" />

              <div className="grid size-36 place-items-center overflow-hidden rounded-md bg-white p-1.5 shadow-md">
                {png ? (
                  <img src={png} alt={`Kod QR — ${label}`} className="h-full w-full object-contain" />
                ) : (
                  <Loader2 className="size-6 animate-spin text-slate-400" />
                )}
              </div>
            </div>

            {/* DÓŁ: ETYKIETA STOLIKA I STOPKA Z GWIAZDKĄ */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                {label}
              </p>
              <p className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                Powered by DajOpinie <span className="text-[#F59E0B] text-xs">★</span>
              </p>
            </div>
          </div>
        </div>

        {/* INPUT Z LINKIEM */}
        <div className="flex items-center gap-2">
          <Input readOnly value={url} className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copy} aria-label="Kopiuj link">
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          </Button>
        </div>

        {/* PRZYCISKI AKCJI */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 font-semibold"
            disabled={!png}
            onClick={() => {
              if (!png) return;
              downloadDataUrl(png, `qr-${slugify(label)}.png`);
              toast.success("Pobrano PNG w wysokiej jakości");
            }}
          >
            <Download className="size-4" />
            Pobierz QR
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={!png}
            onClick={() => {
              if (!png) return;
              const ok = printStand(label, restaurantName, png);
              if (!ok) toast.error("Zezwól na wyskakujące okna, aby wydrukować stojak");
            }}
          >
            <FileText className="size-4" />
            Pobierz PDF na stojak
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}