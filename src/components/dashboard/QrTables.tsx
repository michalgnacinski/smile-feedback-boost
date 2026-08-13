import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Layers,
  Loader2,
  Plus,
  Printer,
  QrCode,
  Trash2,
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
import { downloadAllQrsAsZip, downloadDataUrl, printStand, qrDataUrl, slugify, tableUrl } from "@/lib/qr";
import { cn } from "@/lib/utils";

export interface TableItem {
  id: string;
  label: string;
  codeIdentifier: string;
  scans: number;
  clicks: number;
  conversion?: string;
  url?: string;
}

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

interface QrTablesProps {
  restaurantName?: string;
  restaurantSlug?: string;
  tables?: TableItem[];
  onRefresh?: () => void;
}

export function QrTables({
  restaurantName = "Pizzeria La Torre",
  restaurantSlug,
  tables: initialTables,
  onRefresh,
}: QrTablesProps) {
  const [tables, setTables] = useState<TableItem[]>(initialTables || []);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [preview, setPreview] = useState<TableItem | null>(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (initialTables) {
      setTables(initialTables);
    }
  }, [initialTables]);

  // 👈 Jeśli restaurantSlug nie został przekazany, wyliczamy go dynamicznie z nazwy restauracji
  const slug = restaurantSlug || slugify(restaurantName);
  const urlFor = (t: TableItem) => t.url || tableUrl(slug, t.codeIdentifier || slugify(t.label));

  const getConversionNumber = (t: TableItem) => {
    if (t.scans === 0) return 0;
    return Number(((t.clicks / t.scans) * 100).toFixed(1));
  };

  const downloadOne = async (t: TableItem) => {
    const png = await qrDataUrl(urlFor(t), 1024);
    downloadDataUrl(png, `qr-${slugify(t.label)}.png`);
    toast.success(`Pobrano QR: ${t.label} (PNG)`);
  };

  const printOne = async (t: TableItem) => {
    const png = await qrDataUrl(urlFor(t), 1024);
    if (!printStand(t.label, restaurantName, png))
      toast.error("Zezwól na wyskakujące okna, aby wydrukować stojak");
  };

  // Pobieranie wszystkich kodów QR jako plik ZIP
  const handleDownloadZip = async () => {
    if (tables.length === 0) return;
    setIsZipping(true);
    try {
      await downloadAllQrsAsZip(tables, restaurantName);
      toast.success("Pobrano paczkę ZIP ze wszystkimi kodami QR!");
    } catch (err) {
      toast.error("Błąd podczas pakowania ZIP");
    } finally {
      setIsZipping(false);
    }
  };

  // Drukowanie wszystkich stojaków naraz
  const handlePrintAll = async () => {
    if (tables.length === 0) return;
    for (const t of tables) {
      const png = await qrDataUrl(urlFor(t), 1024);
      printStand(t.label, restaurantName, png);
    }
    toast.success("Otwarto okna drukowania dla wszystkich stojaków");
  };

  // Dodawanie nowego stolika z zapisem w bazie Express/NeonDB
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLabel = label.trim() || `Stolik #${tables.length + 1}`;

    setIsAdding(true);
    try {
      const res = await fetch("http://localhost:3001/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantSlug: slug, label: newLabel }),
      });

      if (!res.ok) throw new Error("Błąd podczas tworzenia stolika");

      toast.success(`Kod QR dla "${newLabel}" został zapisany!`);
      setLabel("");
      setOpen(false);

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      toast.error("Nie udało się dodać nowego stolika");
    } finally {
      setIsAdding(false);
    }
  };

  // Usuwanie stolika z bazy
  const handleDeleteTable = async (t: TableItem) => {
    if (!confirm(`Czy na pewno chcesz usunąć kod QR dla: "${t.label}"?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/qr-codes/${t.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Błąd usuwania");

      toast.success(`Usunięto kod QR dla "${t.label}"`);
      if (onRefresh) {
        onRefresh();
      } else {
        setTables((prev) => prev.filter((item) => item.id !== t.id));
      }
    } catch (err) {
      toast.error("Błąd podczas usuwania stolika");
    }
  };

  return (
    <div className="space-y-4">
      {/* BANER ZBIORCZEGO DRUKOWANIA */}
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
              disabled={isZipping || tables.length === 0}
              onClick={handleDownloadZip}
            >
              {isZipping ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Download className="size-4 mr-1" />
              )}
              Pobierz zbiorczo (ZIP)
            </Button>
            <Button
              variant="outline"
              disabled={tables.length === 0}
              onClick={handlePrintAll}
            >
              <Printer className="size-4 mr-1" />
              Wydrukuj wszystkie
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LISTA STOLIKÓW */}
      <Card className="rise-in border-border bg-card" style={{ animationDelay: "140ms" }}>
        <CardHeader className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <CardTitle className="flex min-w-0 items-center gap-2 text-base">
            <QrCode className="size-4 shrink-0 text-primary" />
            <span className="truncate">Kody QR i stoliki</span>
          </CardTitle>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full font-semibold sm:w-auto glow-gold">
                <Plus className="size-4 mr-1" />
                Dodaj stolik / kod QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm bg-card border-border">
              <DialogHeader>
                <DialogTitle>Nowy kod QR</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleAddTable}>
                <div className="space-y-2">
                  <Label htmlFor="qr-label">Etykieta stolika / strefy</Label>
                  <Input
                    id="qr-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="np. Stolik #05, Bar, Ogródek #01"
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={isAdding} className="w-full font-bold">
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : "Wygeneruj kod"}
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
                <span className="text-primary lg:text-right font-semibold">
                  <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                    Konwersja
                  </span>
                  <CountUpText
                    value={getConversionNumber(t)}
                    decimals={1}
                    suffix="%"
                    delay={i * 70}
                  />
                </span>
              </div>

              <div className="col-span-2 flex flex-wrap justify-end gap-1.5 lg:col-span-1">
                <Button size="sm" className="font-semibold text-xs" onClick={() => downloadOne(t)}>
                  <Download className="size-3.5 mr-1" />
                  Pobierz QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPreview(t)}>
                  <Eye className="size-3.5 mr-1" />
                  <span className="lg:sr-only xl:not-sr-only">Podgląd</span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => printOne(t)}>
                  <FileText className="size-3.5 mr-1" />
                  <span className="lg:sr-only xl:not-sr-only">Stojak PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTable(t)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
                  title="Usuń stolik"
                >
                  <Trash2 className="size-3.5" />
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