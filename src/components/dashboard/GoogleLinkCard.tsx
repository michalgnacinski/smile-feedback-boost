import { useState, useEffect } from "react";
import { Check, ExternalLink, HelpCircle, Link2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GoogleLinkCardProps {
  initialLink?: string;
  slug?: string;
}

// Przykładowy profil Google Maps do testów
const DEFAULT_TEST_LINK = "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4";

export function GoogleLinkCard({
  initialLink,
  slug = "pizzeria-la-torre",
}: GoogleLinkCardProps) {
  const [link, setLink] = useState(initialLink || DEFAULT_TEST_LINK);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialLink) {
      setLink(initialLink);
    }
  }, [initialLink]);

  // Pomocnicza funkcja formatująca poprawny URL
  const formatUrl = (rawUrl: string) => {
    let clean = rawUrl.trim();
    if (!clean) return "";
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return clean;
  };

  // Testowanie linku w nowej karcie
  const handleTestLink = () => {
    const targetUrl = formatUrl(link);
    if (!targetUrl) {
      toast.error("Wprowadź najpierw poprawny link Google!");
      return;
    }
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  // Zapis do bazy danych
  const handleSave = async () => {
    if (editing) {
      const formatted = formatUrl(link);
      setSaving(true);

      try {
        const response = await fetch(`/api/restaurant/${slug}/google-link`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleReviewLink: formatted }),
        });

        if (!response.ok) {
          throw new Error("Nie udało się zapisać linku");
        }

        setLink(formatted);
        toast.success("Link do opinii został zapisany w bazie!");
        setEditing(false);
      } catch (err) {
        console.error(err);
        toast.error("Błąd podczas zapisywania linku do bazy");
      } finally {
        setSaving(false);
      }
    } else {
      setEditing(true);
    }
  };

  return (
    <Card className="rise-in border-border bg-card" style={{ animationDelay: "80ms" }}>
      <CardHeader className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <CardTitle className="flex min-w-0 items-center gap-2 text-base">
          <Link2 className="size-4 shrink-0 text-primary" />
          <span className="truncate">Link do opinii Google</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="Jak pobrać ten link z Google Maps?">
                  <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Jak pobrać ten link z Google Maps? Otwórz profil firmy w Google, kliknij „Poproś o
                opinie” i skopiuj wygenerowany krótki link.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Link aktywny
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/50 p-2 sm:flex-row sm:items-center">
          <Input
            value={link}
            readOnly={!editing}
            onChange={(e) => setLink(e.target.value)}
            aria-label="Link do opinii Google"
            className="border-0 bg-transparent font-mono text-xs shadow-none focus-visible:ring-0"
            placeholder="https://g.page/r/.../review"
          />
          <div className="flex gap-2 sm:shrink-0">
            <Button
              variant={editing ? "default" : "outline"}
              className="flex-1 sm:flex-none"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                <Check className="size-4 mr-1" />
              ) : (
                <Pencil className="size-4 mr-1" />
              )}
              {editing ? "Zapisz" : "Edytuj"}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={handleTestLink}
            >
              <ExternalLink className="size-4 mr-1" />
              Testuj link
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ten link otwiera się gościom po zeskanowaniu kodu QR — sprawdź go raz, a resztę zrobi
          system.
        </p>
      </CardContent>
    </Card>
  );
}