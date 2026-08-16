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
  Sparkles,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { CountUpText } from "@/hooks/use-count-up";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { downloadAllQrsAsZip, downloadDataUrl, printStand, qrDataUrl, slugify } from "@/lib/qr";
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
  logoUrl?: string | null;
  tables?: TableItem[];
  onRefresh?: () => void;
}

export function QrTables({
  restaurantName = "Pizzeria La Torre",
  restaurantSlug,
  logoUrl,
  tables: initialTables,
  onRefresh,
}: QrTablesProps) {
  const [tables, setTables] = useState<TableItem[]>(initialTables || []);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [preview, setPreview] = useState<TableItem | null>(null);

  // Stany generatora hurtowego i pobierania PDF
  const [tableCount, setTableCount] = useState<number>(initialTables?.length || 10);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (initialTables) {
      setTables(initialTables);
      if (initialTables.length > 0) {
        setTableCount(initialTables.length);
      }
    }
  }, [initialTables]);

  const slug = restaurantSlug || slugify(restaurantName);

  const urlFor = (t: TableItem) => {
    if (t.url && t.url.startsWith("http")) return t.url;
    const identifier = t.codeIdentifier || `${slug}-${slugify(t.label)}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
    return `${origin}/r/${identifier}`;
  };

  const getConversionNumber = (t: TableItem) => {
    if (t.scans === 0) return 0;
    return Number(((t.clicks / t.scans) * 100).toFixed(1));
  };

  // 1. Hurtowe generowanie stolików
  const handleBulkCreate = async () => {
    if (!slug) return;
    if (tableCount < 1 || tableCount > 100) {
      toast.error("Podaj liczbę od 1 do 100 stolików.");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/restaurant/${slug}/bulk-tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: tableCount }),
      });

      if (!res.ok) throw new Error("Błąd podczas generowania stolików");

      toast.success(`Wygenerowano kody dla ${tableCount} stolików!`);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd");
    } finally {
      setGenerating(false);
    }
  };

  // 2. Pobieranie gotowego PDF A4 (format 90x50 mm)
  const handleDownloadPdf = async () => {
    if (!slug) return;
    setDownloadingPdf(true);

    try {
      const response = await fetch(`/api/restaurant/${slug}/print-pdf`);
      if (!response.ok) throw new Error("Nie udało się wygenerować pliku PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DajOpinie-${slug}-winietki-90x50.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Pobrano gotowy arkusz A4 do druku (PDF)!");
    } catch (err: any) {
      toast.error(err.message || "Błąd pobierania PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadOne = async (t: TableItem) => {
    const targetUrl = urlFor(t);
    const png = await qrDataUrl(targetUrl, 1024);
    downloadDataUrl(png, `qr-${slugify(t.label)}.png`);
    toast.success(`Pobrano QR: ${t.label} (PNG)`);
  };

  const printOne = async (t: TableItem) => {
    const targetUrl = urlFor(t);
    const png = await qrDataUrl(targetUrl, 1024);
    if (!printStand(t.label, restaurantName, png, logoUrl)) {
      toast.error("Zezwól na wyskakujące okna, aby wydrukować stojak");
    }
  };

  const handlePrintAll = async () => {
    if (tables.length === 0) return;
    for (const t of tables) {
      const png = await qrDataUrl(urlFor(t), 1024);
      printStand(t.label, restaurantName, png, logoUrl);
    }
    toast.success("Otwarto okna drukowania dla wszystkich stojaków");
  };

  const handleDownloadZip = async () => {
    if (tables.length === 0) return;
    setIsZipping(true);
    try {
      const mappedTables = tables.map((t) => ({
        ...t,
        url: urlFor(t),
      }));
      await downloadAllQrsAsZip(mappedTables, restaurantName);
      toast.success("Pobrano paczkę ZIP ze wszystkimi kodami QR!");
    } catch (err) {
      toast.error("Błąd podczas pakowania ZIP");
    } finally {
      setIsZipping(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLabel = label.trim() || `Stolik #${tables.length + 1}`;

    setIsAdding(true);
    try {
      const res = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantSlug: slug, label: newLabel }),
      });

      if (!res.ok) throw new Error("Błąd podczas tworzenia stolika");

      toast.success(`Kod QR dla "${newLabel}" został zapisany!`);
      setLabel("");
      setOpen(false);

      onRefresh?.();
    } catch (err) {
      toast.error("Nie udało się dodać nowego stolika");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTable = async (t: TableItem) => {
    if (!confirm(`Czy na pewno chcesz usunąć kod QR dla: "${t.label}"?`)) return;

    try {
      const res = await fetch(`/api/qr-codes/${t.id}`, {
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
    <div className="space-y-6">
      {/* 🚀 KARTA 1: GENERATOR HURTOWY I ARKUSZ A4 POD STOJACZKI L (90x50 mm) */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <TableIcon className="size-4 text-primary" />
            Generator i Druk Winietek na Stoliki (90×50 mm)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Wpisz łączną liczbę stolików w lokalu. System automatycznie utworzy kody QR oraz przygotuje gotowy do druku arkusz PDF A4.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="w-full sm:w-44 space-y-1.5">
              <Label htmlFor="bulk-count" className="text-xs font-semibold">
                Liczba stolików
              </Label>
              <Input
                id="bulk-count"
                type="number"
                min={1}
                max={100}
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value, 10) || 1)}
                className="h-10 text-sm bg-background/50"
              />
            </div>

            <div className="flex flex-1 flex-wrap gap-2">
              <Button
                onClick={handleBulkCreate}
                disabled={generating}
                variant="outline"
                className="h-10 text-xs font-semibold gap-1.5 flex-1 sm:flex-none"
              >
                {generating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4 text-primary" />
                )}
                {generating ? "Generowanie..." : "Utwórz kody hurtowo"}
              </Button>

              <Button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf || tables.length === 0}
                className="h-10 text-xs font-bold gap-1.5 glow-gold flex-1 sm:flex-none"
              >
                {downloadingPdf ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Printer className="size-4" />
                )}
                {downloadingPdf ? "Przygotowywanie PDF..." : "Pobierz arkusz A4 do druku (PDF)"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📦 KARTA 2: DODATKOWE AKCJE ZBIORCZE (ZIP / STOJAKI A6) */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="grid grid-cols-1 items-center gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Layers className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-semibold">Paczka plików graficznych</p>
              <p className="text-xs text-muted-foreground">
                Pobierz wszystkie kody QR w plikach PNG (np. dla własnego grafika) lub wydrukuj stojaki A6.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isZipping || tables.length === 0}
              onClick={handleDownloadZip}
              className="text-xs"
            >
              {isZipping ? (
                <Loader2 className="size-3.5 mr-1 animate-spin" />
              ) : (
                <Download className="size-3.5 mr-1" />
              )}
              Pobierz grafiki (ZIP)
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={tables.length === 0}
              onClick={handlePrintAll}
              className="text-xs"
            >
              <Printer className="size-3.5 mr-1" />
              Stojaki A6
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 📊 KARTA 3: TABELA ANALITYKI STOLIKÓW */}
      <Card className="border-border bg-card">
        <CardHeader className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center pb-4">
          <CardTitle className="flex min-w-0 items-center gap-2 text-base font-bold">
            <QrCode className="size-4 shrink-0 text-primary" />
            <span className="truncate">Lista aktywnych stolików ({tables.length})</span>
          </CardTitle>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold sm:w-auto">
                <Plus className="size-3.5 mr-1" />
                Dodaj pojedynczy stolik
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">Nowy kod QR</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 pt-2" onSubmit={handleAddTable}>
                <div className="space-y-2">
                  <Label htmlFor="qr-label" className="text-xs font-medium">
                    Etykieta stolika / strefy
                  </Label>
                  <Input
                    id="qr-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="np. Stolik #05, Bar, Ogródek #01"
                    className="h-10 text-sm"
                    autoFocus
                  />
                </div>
                <Button type="submit" disabled={isAdding} className="w-full font-bold glow-gold">
                  {isAdding ? <Loader2 className="size-4 animate-spin" /> : "Utwórz kod"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="hidden grid-cols-[auto_minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto] items-center gap-3 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground lg:grid">
            <span className="w-10" />
            <span>Etykieta</span>
            <span className="text-right">Skany</span>
            <span className="text-right">Kliknięcia</span>
            <span className="text-right">Konwersja</span>
            <span className="text-right">Akcje</span>
          </div>

          {tables.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Brak utworzonych stolików. Wpisz liczbę powyżej i kliknij „Utwórz kody hurtowo”.
            </p>
          ) : (
            tables.map((t, i) => (
              <div
                key={t.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3 rounded-xl border border-border bg-background/40 p-3 lg:grid-cols-[auto_minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto]"
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
                  <p className="truncate text-xs sm:text-sm font-semibold">{t.label}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground lg:hidden">
                    {urlFor(t)}
                  </p>
                </div>

                <div className="col-span-2 grid grid-cols-3 gap-2 border-t border-border/50 pt-2 text-xs sm:text-sm lg:col-span-1 lg:contents lg:border-0 lg:pt-0">
                  <span className="lg:text-right">
                    <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                      Skany
                    </span>
                    <CountUpText value={t.scans} delay={i * 50} />
                  </span>
                  <span className="lg:text-right">
                    <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                      Kliknięcia
                    </span>
                    <CountUpText value={t.clicks} delay={i * 50} />
                  </span>
                  <span className="text-primary lg:text-right font-bold">
                    <span className="block text-[10px] uppercase text-muted-foreground lg:hidden">
                      Konwersja
                    </span>
                    <CountUpText
                      value={getConversionNumber(t)}
                      decimals={1}
                      suffix="%"
                      delay={i * 50}
                    />
                  </span>
                </div>

                <div className="col-span-2 flex flex-wrap justify-end gap-1.5 lg:col-span-1">
                  <Button size="sm" variant="outline" className="font-semibold text-xs h-8" onClick={() => downloadOne(t)}>
                    <Download className="size-3 mr-1" />
                    PNG
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setPreview(t)}>
                    <Eye className="size-3 mr-1" />
                    Podgląd
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => printOne(t)}>
                    <FileText className="size-3 mr-1" />
                    Stojak
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTable(t)}
                    className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive px-2"
                    title="Usuń stolik"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <QrPreviewDialog
        open={preview !== null}
        onOpenChange={(v) => !v && setPreview(null)}
        label={preview?.label ?? ""}
        url={preview ? urlFor(preview) : ""}
        restaurantName={restaurantName}
        logoUrl={logoUrl}
      />
    </div>
  );
}