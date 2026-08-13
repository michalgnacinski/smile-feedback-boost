import { useState } from "react";
import { Check, Edit2, ExternalLink, Link2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface GoogleLinkCardProps {
  slug: string;
  initialLink: string | null;
  isHighlighted?: boolean;
}

export function GoogleLinkCard({ slug, initialLink, isHighlighted }: GoogleLinkCardProps) {
  const [googleLink, setGoogleLink] = useState(initialLink || "");
  const [isEditing, setIsEditing] = useState(!initialLink); // Domyślnie włączony tryb edycji jeśli link jest pusty
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!googleLink.trim()) {
      toast.error("Wprowadź prawidłowy link Google Review!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/api/restaurant/${slug}/google-link`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleReviewLink: googleLink }),
      });

      if (!res.ok) throw new Error("Błąd podczas zapisu");

      toast.success("Link do opinii Google został pomyślnie zapisany!");
      setIsEditing(false);
    } catch (err) {
      toast.error("Nie udało się zapisać linku.");
    } finally {
      setSaving(false);
    }
  };

  const hasLink = Boolean(googleLink && googleLink.trim().length > 0);

  return (
    <Card
      id="google-link-card"
      className={`transition-all duration-500 border-border bg-card ${
        isHighlighted || !hasLink
          ? "ring-2 ring-primary shadow-lg shadow-primary/20 border-primary"
          : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Link2 className="size-5 text-primary" />
          <CardTitle className="text-base font-bold">Link do opinii Google</CardTitle>
        </div>
        {hasLink ? (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Link aktywny
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 gap-1.5">
            <AlertTriangle className="size-3 text-amber-400" />
            Wymagane uzupełnienie
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Wklej bezpośredni link do wystawiania opinii w Google Maps dla Twojego lokalu:
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={googleLink}
                onChange={(e) => setGoogleLink(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="text-sm font-mono flex-1"
                autoFocus={!hasLink}
              />
              <Button onClick={handleSave} disabled={saving} className="font-bold">
                {saving ? "Zapisywanie..." : "Zapisz link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-background/50 border border-border">
            <span className="font-mono text-xs truncate max-w-xl text-muted-foreground">
              {googleLink}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 text-xs"
              >
                <Edit2 className="size-3.5" />
                Edytuj
              </Button>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="gap-1.5 text-xs"
              >
                <a href={googleLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                  Testuj link
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}