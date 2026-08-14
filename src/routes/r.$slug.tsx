import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Store, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/r/$slug")({
  head: () => ({
    meta: [
      { title: "Oceń nas w Google — DajOpinie" },
      { name: "description", content: "Szybka opinia w Google Maps." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ScanPage,
});

interface ScanData {
  qrCodeId?: string;
  restaurantName: string;
  logoUrl: string | null;
  tableLabel?: string;
  googleReviewLink: string | null;
  isDemo?: boolean;
}

export function ScanPage() {
  const { slug } = useParams({ from: "/r/$slug" });
  const [data, setData] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const isDemo = slug === "demo" || slug === "demo-qr";

  useEffect(() => {
    // 1. TRYB DEMO
    if (isDemo) {
      setData({
        restaurantName: "Przykładowy Lokal (Demo)",
        logoUrl: null,
        tableLabel: "Stolik demonstracyjny",
        googleReviewLink: null,
        isDemo: true,
      });
      setLoading(false);
      return;
    }

    // 2. TRYB RZECZYWISTY
    fetch(`/api/scan/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Kod QR jest nieaktywny");
        }
        return res.json();
      })
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Nie udało się załadować strony lokalu.");
        setLoading(false);
      });
  }, [slug, isDemo]);

  const handleReviewClick = async () => {
    if (data?.isDemo) {
      toast.info(
        "To jest podgląd demonstracyjny. W wersji rzeczywistej gość trafia bezpośrednio do profilu Twojej firmy w Google Maps!"
      );
      return;
    }

    if (!data?.googleReviewLink) {
      toast.error("Ten lokal nie skonfigurował jeszcze linku do wizytówki Google.");
      return;
    }

    setRedirecting(true);

    if (data.qrCodeId) {
      try {
        await fetch(`/api/click/${data.qrCodeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Błąd rejestracji kliknięcia:", e);
      }
    }

    window.location.href = data.googleReviewLink;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-[#070b12] text-slate-400">
        <p className="text-xs font-semibold animate-pulse">Ładowanie...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-[#070b12] p-4 text-center">
        <div className="max-w-sm space-y-3 rounded-2xl border border-border/40 bg-card p-6 shadow-2xl">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <h2 className="text-base font-bold text-foreground">Nieprawidłowy kod QR</h2>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-[#111827] via-[#0b1222] to-[#030712] p-6 text-foreground select-none overflow-hidden">
      
      {/* SUBTELNE ŚWIATŁO TŁA (RADIAL GLOW W GÓRNEJ CZĘŚCI) */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/10 blur-3xl" />

      {/* GÓRNY PASEK: BANER DLA DEMO LUB PUSTE MIEJSCE */}
      <div className="w-full max-w-sm flex justify-center z-10">
        {data.isDemo ? (
          <div className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-center text-xs font-medium text-amber-200 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2">
            Podgląd demonstracyjny dla odwiedzających
          </div>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* ŚRODKOWA KARTA POWITANIA */}
      <div className="my-auto flex w-full max-w-sm flex-col items-center text-center z-10">
        
        {/* LOGO LOKALU Z CIEKAWSZYM OBRAMOWANIEM */}
        <div className="mb-5 flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-2.5 shadow-2xl ring-1 ring-white/15">
          {data.logoUrl ? (
            <img
              src={data.logoUrl}
              alt={data.restaurantName}
              className="h-full w-full object-contain rounded-xl"
            />
          ) : (
            <Store className="size-10 text-primary" />
          )}
        </div>

        {/* NAZWA LOKALU */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          {data.restaurantName}
        </h2>
        
        <br/>
        {/* GŁÓWNY NAGŁÓWEK */}
        <h1 className="text-2xl font-extrabold text-white mt-1 mb-3">
          Smakowało? Dziękujemy za wizytę!
        </h1>
        <p className="text-xs text-slate-300/80 leading-relaxed max-w-xs mb-8">
          Twoja opinia pomaga naszej restauracji rosnąć i docierać do nowych gości.
        </p>

        {/* PRZYCISK OPINII GOOGLE */}
        <div className="w-full space-y-3">
          <Button
            size="lg"
            onClick={handleReviewClick}
            disabled={redirecting}
            className="w-full h-14 bg-primary text-slate-950 hover:bg-amber-400 font-extrabold text-sm rounded-xl glow-gold flex flex-col items-center justify-center gap-1 shadow-2xl transition-all duration-200 active:scale-[0.98]"
          >
            <div className="flex items-center gap-1 text-slate-950">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-3.5 fill-slate-950 text-slate-950" />
              ))}
            </div>
            <span>{redirecting ? "Przekierowywanie..." : "Oceń nas w Google"}</span>
          </Button>

          <p className="text-[11px] text-slate-400">
            {data.isDemo
              ? "Przycisk demonstracyjny (zabezpieczony)"
              : "Zajmuje tylko 5 sekund. Nie wymagamy zakładania konta."}
          </p>
        </div>
      </div>

      {/* STOPKA: ELEGANCKIE LOGO DAJOPINIE */}
      <footer className="pt-6 pb-2 z-10">
        <div className="flex flex-col items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Powered by
          </span>
          <div className="scale-90">
            <Logo />
          </div>
        </div>
      </footer>
    </div>
  );
}