import { Link } from "@tanstack/react-router";
import { ArrowRight, Handshake, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import qrReviewCard from "@/assets/qr-review-card.jpg";

export function Hero({ onTrial }: { onTrial: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 size-[36rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--emerald-deep)" }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            Dla restauracji, kawiarni i lokalnej gastronomii 🍕
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] md:text-5xl lg:text-6xl">
            Więcej 5-gwiazdkowych opinii w Google.{" "}
            <span className="text-primary">Zero pracy dla Twojego zespołu.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Nasz pasywny system ze stojakiem QR na stoliku przekierowuje gości czekających na
            rachunek bezpośrednio do pisania opinii w Google. Bez kuponów, bez ryzyka bana, w 100%
            zgodnie z zasadami Google.
          </p>

          <div className="relative mt-6 lg:hidden">
            <div className="overflow-hidden rounded-2xl border border-border shadow-elevated">
              <img
                src={qrReviewCard}
                alt="Przykładowa karta QR dla restauracji: Twoje Logo, Jak podobała Ci się wizyta?, Podziel się swoją opinią, oraz QR kod z napisem Powered by DajOpinie"
                width={1024}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 right-4 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-elevated sm:block">
              <p className="text-2xl font-bold text-primary">+248</p>
              <p className="text-xs text-muted-foreground">skanów w tym miesiącu</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" onClick={onTrial} className="h-14 px-7 text-base font-semibold glow-gold">
              Rozpocznij 14-dniowy darmowy test
              <ArrowRight className="size-5" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 border-2 border-primary px-7 text-base font-semibold text-primary hover:bg-primary hover:text-primary-foreground pulse-gold"
            >
              <Link to="/r/$slug" params={{ slug: "pizzeria-la-torre-01" }}>
                <QrCode className="size-5" />
                Zobacz jak to działa (Demo QR)
              </Link>
            </Button>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-success" />
            Bez karty kredytowej · Anulujesz jednym kliknięciem
          </p>

          <p className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">
            <Handshake className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Po kontakcie <span className="font-semibold text-foreground">przyjeżdżamy do Twojej
              restauracji</span> i osobiście pomagamy uruchomić DajOpinie — ustawiamy link Google,
              kody QR i stojaki na stolikach.
            </span>
          </p>

        </div>

        <div className="relative hidden lg:block">
          <div className="overflow-hidden rounded-2xl border border-border shadow-elevated">
            <img
              src={qrReviewCard}
              alt="Przykładowa karta QR dla restauracji: Twoje Logo, Jak podobała Ci się wizyta?, Podziel się swoją opinią, oraz QR kod z napisem Powered by DajOpinie"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 right-4 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-elevated sm:block">
            <p className="text-2xl font-bold text-primary">+248</p>
            <p className="text-xs text-muted-foreground">skanów w tym miesiącu</p>
          </div>
        </div>
      </div>
    </section>
  );
}
