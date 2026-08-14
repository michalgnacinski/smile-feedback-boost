import { Lock, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TrialExpiredPaywallProps {
  restaurantName: string;
  totalScans: number;
  onActivate: () => void;
  loading?: boolean;
}

export function TrialExpiredPaywall({
  restaurantName,
  totalScans,
  onActivate,
  loading = false,
}: TrialExpiredPaywallProps) {
  return (
    <div className="relative mx-auto max-w-2xl py-6 animate-in fade-in zoom-in-95 duration-300">
      <Card className="overflow-hidden border-primary/40 bg-gradient-to-b from-card to-secondary/30 shadow-2xl backdrop-blur-md">
        <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Lock className="size-4" />
            Okres próbny dobiegł końca
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {restaurantName}
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-8 ring-primary/10">
            <Sparkles className="size-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Odblokuj pełny dostęp do DajOpinie
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Twój 14-dniowy bezpłatny test dobiegł końca. W tym czasie goście wykonali{" "}
              <strong className="text-foreground font-bold">{totalScans} skanów</strong> Twoich kodów QR.
            </p>
          </div>

          {/* KORZYŚCI Z SUBSKRYPCJI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left py-2">
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
              <Zap className="size-4 text-primary" />
              <p className="text-xs font-bold text-foreground">Nielimitowane kody</p>
              <p className="text-[11px] text-muted-foreground">Generuj kody dla wszystkich stolików i stref.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
              <ShieldCheck className="size-4 text-primary" />
              <p className="text-xs font-bold text-foreground">Ochrona Google</p>
              <p className="text-[11px] text-muted-foreground">100% zgodność z regulaminem opinii Google.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
              <Sparkles className="size-4 text-primary" />
              <p className="text-xs font-bold text-foreground">Analityka na żywo</p>
              <p className="text-[11px] text-muted-foreground">Śledź konwersję i liczbę nowych recenzji.</p>
            </div>
          </div>

          {/* CENA I PRZYCISK */}
          <div className="pt-2 border-t border-border space-y-4">
            <div>
              <span className="text-3xl font-extrabold text-foreground">99 PLN</span>
              <span className="text-xs text-muted-foreground"> netto / miesiąc</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Bez umowy długoterminowej · Anulujesz w dowolnym momencie
              </p>
            </div>

            <Button
              size="lg"
              onClick={onActivate}
              disabled={loading}
              className="w-full sm:w-auto min-w-[240px] font-bold text-sm h-12 glow-gold shadow-lg"
            >
              {loading ? "Przekierowywanie..." : "Aktywuj subskrypcję teraz →"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}