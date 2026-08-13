import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload, Trash2, Check, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogoUploadCardProps {
  slug: string;
  restaurantName: string;
  initialLogoUrl: string | null;
  onSuccess: () => void;
}

export function LogoUploadCard({
  slug,
  restaurantName,
  initialLogoUrl,
  onSuccess,
}: LogoUploadCardProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLogoUrl(initialLogoUrl);
  }, [initialLogoUrl]);

  // Obsługa wyboru pliku z dysku i konwersja na Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Plik jest za duży! Maksymalny rozmiar to 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (newUrl: string | null) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/api/restaurant/${slug}/logo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: newUrl }),
      });

      if (!res.ok) throw new Error("Błąd zapisu");

      toast.success(newUrl ? "Logo zostało pomyślnie zapisane!" : "Logo zostało usunięte.");
      setLogoUrl(newUrl);
      onSuccess();
    } catch (err) {
      toast.error("Nie udało się zapisać logo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="size-5 text-primary" />
          <CardTitle className="text-base font-bold">Logo Restauracji</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* PODGLĄD LOGO W RAMCE 1:1 JAK NA STRONIE SKANU */}
          <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-900/60 p-2 shadow-inner shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`Logo — ${restaurantName}`}
                className="h-full w-full object-contain rounded-xl"
              />
            ) : (
              <Store className="size-8 text-muted-foreground/60" />
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h4 className="font-semibold text-sm">Wgraj sygnet / logo lokalu</h4>
            <p className="text-xs text-muted-foreground">
              Zalecany format PNG z przezroczystym tłem lub kwadratowe JPG (max 3 MB).
              Będzie ono wyświetlać się na górze strony po zeskanowaniu kodu QR przez gościa.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs font-semibold">
                  <span>
                    <Upload className="size-3.5" />
                    Wybierz plik
                  </span>
                </Button>
              </label>

              {logoUrl !== initialLogoUrl && (
                <Button
                  size="sm"
                  onClick={() => handleSave(logoUrl)}
                  disabled={saving}
                  className="gap-1.5 text-xs font-bold glow-gold"
                >
                  <Check className="size-3.5" />
                  Zapisz logo
                </Button>
              )}

              {logoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(null)}
                  disabled={saving}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Usuń
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}