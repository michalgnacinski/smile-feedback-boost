import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Star, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

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

export function ScanPage() {
  const { slug } = useParams({ from: "/r/$slug" });

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [scanData, setScanData] = useState<{
    restaurantName: string;
    logoUrl?: string;
    tableLabel: string;
    googleReviewLink: string;
    qrCodeId: string;
  } | null>(null);

  // 1. Rejestracja SKANU i pobranie danych po wejściu na stronę
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/scan/${slug}`, { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error("Błąd skanowania");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setScanData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 2. Rejestracja KLIKNIĘCIA i przekierowanie do Google Reviews
  const handleClick = async () => {
    if (!scanData) return;
    setRedirecting(true);

    try {
      await fetch(`/api/click/${scanData.qrCodeId}`, { method: "POST" });
    } catch (e) {
      console.error("Błąd zapisu kliknięcia:", e);
    } finally {
      const targetLink =
        scanData.googleReviewLink && !scanData.googleReviewLink.includes("ExampleID")
          ? scanData.googleReviewLink
          : "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4";

      window.location.href = targetLink;
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <Loader2 className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="pop-in w-full max-w-md text-center">
        {/* LOGO RESTAURACJI / IKONA ZASUWAJĄCA */}
        <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white/10 p-2 shadow-lg backdrop-blur-md">
          {scanData?.logoUrl ? (
            <img
              src={scanData.logoUrl}
              alt={`Logo — ${scanData.restaurantName}`}
              className="h-full w-full object-contain rounded-xl"
            />
          ) : (
            <UtensilsCrossed className="size-8 text-primary" />
          )}
        </div>

        <h1 className="mt-4 text-xl font-bold tracking-tight">
          {scanData?.restaurantName || "Pizzeria La Torre"}
        </h1>

        {/* ZACHĘTA */}
        <h2
          className="rise-in mt-8 text-2xl font-extrabold leading-snug"
          style={{ animationDelay: "200ms" }}
        >
          Smakowało? Dziękujemy za wizytę!
        </h2>
        <p
          className="rise-in mt-3 text-sm leading-relaxed text-muted-foreground"
          style={{ animationDelay: "300ms" }}
        >
          Twoja opinia pomaga naszej restauracji rosnąć i docierać do nowych gości.
        </p>

        {/* PRZYCISK Z GWIAZDKAMI */}
        <Button
          onClick={handleClick}
          disabled={redirecting}
          className="press sheen sheen-fast breathe mt-9 h-auto w-full flex-col gap-2 rounded-2xl py-5 text-base font-bold glow-gold active:scale-95 transition-all"
        >
          <span className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="star-pop size-5 fill-current text-primary-foreground"
                style={{ animationDelay: `${420 + i * 110}ms` }}
              />
            ))}
          </span>
          <span>{redirecting ? "Przekierowujemy do Google…" : "Oceń nas w Google"}</span>
        </Button>

        <p className="mt-6 text-xs text-muted-foreground">
          Skanowanie zajmuje 5 sekund. Nie wymagamy zakładania konta.
        </p>

        <div className="mt-8 flex justify-center">
          <Logo imgClassName="h-4" />
        </div>
      </div>
    </main>
  );
}