import { useState } from "react";
import { Check, ExternalLink, HelpCircle, Link2, Pencil } from "lucide-react";
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
import { googleReviewLink } from "@/lib/mock-data";

export function GoogleLinkCard() {
  const [link, setLink] = useState(googleReviewLink);
  const [editing, setEditing] = useState(false);

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
                opinie” i skopiuj wygenerowany krótki link (g.page/r/…/review).
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
          />
          <div className="flex gap-2 sm:shrink-0">
            <Button
              variant={editing ? "default" : "outline"}
              className="flex-1 sm:flex-none"
              onClick={() => {
                if (editing) toast.success("Link do opinii zapisany");
                setEditing((v) => !v);
              }}
            >
              {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
              {editing ? "Zapisz" : "Edytuj"}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 sm:flex-none"
              onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="size-4" />
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
