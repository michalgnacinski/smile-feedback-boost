import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";

interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantSlug: string;
  onSuccess: () => void;
}

export function AddTableDialog({
  open,
  onOpenChange,
  restaurantSlug,
  onSuccess,
}: AddTableDialogProps) {
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantSlug, label }),
      });

      if (!res.ok) throw new Error("Błąd tworzenia stolika");

      toast.success(`Stolik "${label}" został pomyślnie dodany!`);
      setLabel("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error("Nie удалось dodać nowego stolika");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Dodaj nowy stolik / strefę</DialogTitle>
          <DialogDescription className="text-xs">
            Wpisz etykietę dla nowego kodu QR (np. Stolik #05, Bar, Ogródek #02).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="table-label" className="text-xs">Etykieta stolika</Label>
            <Input
              id="table-label"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="np. Stolik #02"
              className="text-sm"
              autoFocus
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full font-bold glow-gold">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 mr-1.5" />}
            Utwórz kod QR
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}