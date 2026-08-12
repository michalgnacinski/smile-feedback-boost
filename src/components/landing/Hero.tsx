import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, Handshake, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import qrReviewCard from "@/assets/qr-review-card.jpg";

function HeroMockup({ float = false }: { float?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 10 });
  };

  return (
    <div className={float ? "float-slow animate-in fade-in zoom-in-95 duration-1000" : undefined} style={{ perspective: "1200px" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-6 rounded-full opacity-40 blur-3xl animate-pulse"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--primary) 55%, transparent), transparent)",
        }}
      />
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="relative overflow-hidden rounded-2xl border border-primary/25 shadow-elevated transition-transform duration-300 ease-out will-change-transform group"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x || tilt.y ? 1.02 : 1})`,
          boxShadow:
            "0 30px 70px -30px oklch(0 0 0 / 0.85), 0 0 60px -20px color-mix(in oklab, var(--primary) 45%, transparent)",
        }}
      >
        <img
          src={qrReviewCard}
          alt="Przykładowa karta QR dla restauracji"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-scale duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 backdrop-blur-[2px]"
          style={{
            maskImage: "linear-gradient(to top, black, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          }}
        />
      </div>
      <div className="absolute -bottom-5 right-4 hidden rounded-xl border border-border bg-card/90 px-4 py-3 shadow-elevated backdrop-blur-xl sm:block animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
        <p className="text-2xl font-bold text-primary">+248</p>
        <p className="text-xs text-muted-foreground">skanów w tym miesiącu</p>
      </div>
    </div>
  );
}

export function Hero({ onTrial }: { onTrial: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 size-[36rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--emerald-deep)" }}
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        <div className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[3rem]"
            style={{
              background:
                "radial-gradient(60% 55% at 25% 35%, color-mix(in oklab, var(--background) 92%, black), transparent 75%)",
            }}
          />
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-500">
            Dla restauracji, kawiarni i lokalnej gastronomii 🍕
          </span>

          <h1
            className="mt-6 text-4xl font-extrabold leading-[1.08] md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
            style={{ animationDelay: "100ms" }}
          >
            Więcej 5-gwiazdkowych opinii w Google.{" "}
            <span className="text-primary">Zero pracy dla Twojego zespołu.</span>
          </h1>

          <p
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg animate-in fade-in slide-in-from-bottom-5 duration-700 fill-mode-backwards"
            style={{ animationDelay: "200ms" }}
          >
            Nasz pasywny system ze stojakiem QR na stoliku przekierowuje gości czekających na
            rachunek bezpośrednio do pisania opinii w Google. Bez kuponów, bez ryzyka bana, w 100%
            zgodnie z zasadami Google.
          </p>

          <div className="relative mt-8 lg:hidden">
            <HeroMockup />
          </div>

          <div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-backwards"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              size="lg"
              onClick={onTrial}
              className="press sheen h-14 shrink-0 whitespace-nowrap px-6 text-base font-semibold glow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Rozpocznij 14-dniowy darmowy test
              <ArrowRight className="size-5" />
            </Button>
            <Button
            asChild
            size="lg"
            variant="outline"
            className="press sheen h-14 shrink-0 whitespace-nowrap border-2 border-primary px-6 text-base font-semibold text-primary hover:bg-primary hover:text-primary-foreground pulse-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link to="/r/$slug" params={{ slug: "pizzeria-la-torre-stolik01" }}>
              <QrCode className="size-5" />
              Zobacz jak to działa (Demo QR)
            </Link>
          </Button>
          </div>

          <p
            className="mt-5 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in duration-700 fill-mode-backwards"
            style={{ animationDelay: "400ms" }}
          >
            <ShieldCheck className="size-4 text-success" />
            Bez karty kredytowej · Anulujesz jednym kliknięciem
          </p>

          <p
            className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-secondary/60 p-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-backwards"
            style={{ animationDelay: "500ms" }}
          >
            <Handshake className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>
              Po kontakcie <span className="font-semibold text-foreground">przyjeżdżamy do Twojej
              restauracji</span> i osobiście pomagamy uruchomić DajOpinie — ustawiamy link Google,
              kody QR i stojaki na stolikach.
            </span>
          </p>
        </div>

        <div className="relative hidden lg:block">
          <HeroMockup float />
        </div>
      </div>
    </section>
  );
}