import { useState } from "react";
import { Download, Plus, Printer, QrCode } from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { conversion, qrTables, type TableQr } from "@/lib/mock-data";

export function QrTables() {
  const [tables, setTables] = useState<TableQr[]>(qrTables);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="size-4 text-primary" />
          Kody QR i stoliki
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="font-semibold">
              <Plus className="size-4" />
              Dodaj nowy stolik / kod QR
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
                  { id: crypto.randomUUID(), label: label || `Stolik #${t.length + 1}`, scans: 0, clicks: 0 },
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
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Etykieta</TableHead>
              <TableHead className="text-right">Skany</TableHead>
              <TableHead className="text-right">Kliknięcia</TableHead>
              <TableHead className="text-right">Konwersja</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.label}</TableCell>
                <TableCell className="text-right">{t.scans}</TableCell>
                <TableCell className="text-right">{t.clicks}</TableCell>
                <TableCell className="text-right text-primary">{conversion(t)}%</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success(`Pobrano QR: ${t.label} (PNG)`)}
                    >
                      <Download className="size-4" />
                      <span className="hidden sm:inline">Pobierz QR (PNG)</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Szablon stojaka gotowy: ${t.label} (PDF)`)}
                    >
                      <Printer className="size-4" />
                      <span className="hidden sm:inline">Drukuj stojak (PDF)</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
