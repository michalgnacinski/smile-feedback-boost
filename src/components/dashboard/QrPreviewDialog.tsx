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
import { downloadDataUrl, printStand, qrDataUrl } from "@/lib/qr";
import { slugify } from "@/lib/qr";

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

        <div className="rounded-2xl border border-border bg-secondary p-4">
          <div className="mx-auto flex max-w-[16rem] flex-col items-center gap-3 rounded-xl bg-brand-surface p-5 text-center shadow-elevated">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {restaurantName}
            </p>
            <p className="text-sm font-semibold text-slate-900">Jak podobała Ci się wizyta?</p>
            <div className="grid size-40 place-items-center overflow-hidden rounded-lg border-4 border-primary bg-white">
              {png ? (
                <img src={png} alt={`Kod QR — ${label}`} className="h-full w-full object-contain" />
              ) : (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              )}
            </div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">
              {label} · Powered by DajOpinie
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input readOnly value={url} className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copy} aria-label="Kopiuj link">
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
          </Button>
        </div>

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
            Pobierz PNG
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
