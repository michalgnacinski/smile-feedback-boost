import { useState } from "react";
import { HelpCircle, Link2, Pencil } from "lucide-react";
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
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="size-4 text-primary" />
          Link do opinii Google
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="Jak pobrać ten link z Google Maps?">
                  <HelpCircle className="size-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Jak pobrać ten link z Google Maps? Otwórz profil firmy w Google, kliknij „Poproś o
                opinie” i skopiuj wygenerowany krótki link (g.page/r/…/review).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={link}
          readOnly={!editing}
          onChange={(e) => setLink(e.target.value)}
          className="font-mono text-xs"
        />
        <Button
          variant={editing ? "default" : "outline"}
          className="shrink-0"
          onClick={() => {
            if (editing) toast.success("Link do opinii zapisany");
            setEditing((v) => !v);
          }}
        >
          <Pencil className="size-4" />
          {editing ? "Zapisz" : "Edytuj"}
        </Button>
      </CardContent>
    </Card>
  );
}
