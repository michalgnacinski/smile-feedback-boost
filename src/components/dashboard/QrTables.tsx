import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Layers,
  Plus,
  Printer,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { CountUpText } from "@/hooks/use-count-up";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrPreviewDialog } from "@/components/dashboard/QrPreviewDialog";
import { conversion, qrTables, type TableQr } from "@/lib/mock-data";
import { downloadDataUrl, printStand, qrDataUrl, slugify, tableUrl } from "@/lib/qr";
import { cn } from "@/lib/utils";

function MiniQr({ url, className }: { url: string; className?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    qrDataUrl(url, 128).then((d) => active && setSrc(d));
    return () => {
      active = false;
    };
  }, [url]);
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-white",
        className,
      )}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null}
    </span>
  );
}

export function QrTables({ restaurantName = "Pizzeria La Torre" }: { restaurantName?: string }) {
  const [tables, setTables] = useState<TableQr[]>(qrTables);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [preview, setPreview] = useState<TableQr | null>(null);

  const slug = slugify(restaurantName);
  const urlFor = (t: TableQr) => tableUrl(slug, t.label);

  const downloadOne = async (t: TableQr) => {
    const png = await qrDataUrl(urlFor(t), 1024);
    downloadDataUrl(png, `qr-${slugify(t.label)}.png`);
    toast.success(`Pobrano QR: ${t.label} (PNG)`);
  };

  const printOne = async (t: TableQr) => {
    const png = await qrDataUrl(urlFor(t), 1024);
    if (!printStand(t.label, restaurantName, png))
      toast.error("Zezwól na wyskakujące okna, aby wydrukować stojak");
  };

  return (
    <div className="space-y-4">
      <Card className="rise-in border-primary/40 bg-card" style={{ animationDelay: "60ms" }}>
        <CardContent className="grid grid-cols-1 items-center gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Layers className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">Przygotuj wszystkie stojaki naraz</p>
              <p className="text-xs text-muted-foreground">
                Pobierz komplet kodów QR lub wydrukuj gotowe szablony dla {tables.length} stolików.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="font-semibold"
              onClick={() => toast.success("Pakiet ZIP ze wszystkimi kodami QR jest generowany")}
            >
              <Download className="size-4" />
              Pobierz zbiorczo (ZIP)
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.success("Szablony stojaków dla wszystkich stolików gotowe")}
            >
              <Printer className="size-4" />
              Wydrukuj wszystkie
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rise-in border-border bg-card" style={{ animationDelay: "140ms" }}>
        <CardHeader className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <CardTitle className="flex min-w-0 items-center gap-2 text-base">
            <QrCode className="size-4 shrink-0 text-primary" />
            <span className="truncate">Kody QR i stoliki</span>
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full font-semibold sm:w-auto">
                <Plus className="size-4" />
                Dodaj stolik / kod QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Nowy kod QR</DialogTitle>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setTables((t) => [
                    ...t,
                    {
                      id: crypto.randomUUID(),
                      label: label || `Stolik #${t.length + 1}`,
                      scans: 0,
                      clicks: 0,
                    },
                  ]);
                  setLabel("");
                  setOpen(false);
                  toast.success("Kod QR wygenerowany");
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="qr-label">Etykieta</Label>
                  <Input
                    id="qr-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Stolik #05"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Wygeneruj kod
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="hidden grid-cols-[auto_minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto] items-center gap-3 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
            <span className="w-10" />
            <span>Etykieta</span>
            <span className="text-right">Skany</span>
            <span className="text-right">Kliknięcia</span>
            <span className="text-right">Konwersja</span>
            <span className="text-right">Akcje / QR</span>
          </div>

          {tables.map((t, i) => (
            <div
              key={t.id}
              className="rise-in hover-lift grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 rounded-xl border border-border bg-secondary/40 p-3 lg:grid-cols-[auto_minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto]"
              style={{ animationDelay: `${220 + i * 50}ms` }}
            >

              <button
                type="button"
                onClick={() => setPreview(t)}
                aria-label={`Podgląd kodu QR — ${t.label}`}
                className="rounded-md transition-transform hover:scale-105"
              >
                <MiniQr url={urlFor(t)} />
              </button>

              <div className="min-w-0">
                <p className="truncate font-medium">{t.label}</p>
                <p className="truncate font-mono text-[11px] text-muted-foreground lg:hidden">
                  {urlFor(t)}
                </p>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm lg:col-span-1 lg:contents lg:border-0 lg:pt-0">
                <span className="lg:text-right">
                  <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                    Skany
                  </span>
                  <CountUpText value={t.scans} delay={i * 70} />
                </span>
                <span className="lg:text-right">
                  <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                    Kliknięcia
                  </span>
                  <CountUpText value={t.clicks} delay={i * 70} />
                </span>
                <span className="text-primary lg:text-right">
                  <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                    Konwersja
                  </span>
                  <CountUpText value={conversion(t)} decimals={1} suffix="%" delay={i * 70} />
                </span>
              </div>

              <div className="col-span-2 flex flex-wrap justify-end gap-2 lg:col-span-1">
                <Button size="sm" className="font-semibold" onClick={() => downloadOne(t)}>
                  <Download className="size-4" />
                  Pobierz QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreview(t)}>
                  <Eye className="size-4" />
                  <span className="lg:sr-only xl:not-sr-only">Podgląd</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => printOne(t)}>
                  <FileText className="size-4" />
                  <span className="lg:sr-only xl:not-sr-only">Drukuj stojak PDF</span>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <QrPreviewDialog
        open={preview !== null}
        onOpenChange={(v) => !v && setPreview(null)}
        label={preview?.label ?? ""}
        url={preview ? urlFor(preview) : ""}
        restaurantName={restaurantName}
      />
    </div>
  );
}
