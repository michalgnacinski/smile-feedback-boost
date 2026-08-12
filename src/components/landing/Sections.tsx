import { BarChart3, Check, MousePointerClick, QrCode, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: QrCode,
    title: "Krok 1: Postaw stojak QR",
    text: "Dedykowany kod QR na stoliku lub przy kasie. Drukujesz gotowy szablon i stawiasz — to całe wdrożenie.",
  },
  {
    icon: MousePointerClick,
    title: "Krok 2: Bezpośrednie przekierowanie",
    text: "Gość skanuje kod i jednym kliknięciem trafia do aplikacji Google Maps, prosto do okna wystawiania opinii.",
  },
  {
    icon: BarChart3,
    title: "Krok 3: Analizuj i rośnij",
    text: "Śledź statystyki skanów, konwersję każdego stolika i wyprzedzaj lokalną konkurencję.",
  },
];

const comparison = [
  { label: "Koszt miesięczny", us: "99 PLN netto", them: "1000+ PLN netto" },
  { label: "Zgodność z Google", us: "100% Google Compliant", them: "Ryzykowne rabaty za opinie" },
  { label: "Zaangażowanie zespołu", us: "Zero pracy zespołu", them: "Kelner musi prosić gości" },
  { label: "Umowa", us: "Brak umów rocznych", them: "Umowy na 12 miesięcy" },
  { label: "Wdrożenie", us: "5 minut", them: "Tygodnie ustaleń" },
];

const planFeatures = [
  "Nielimitowane skany QR",
  "Generator kodów dla wielu stolików",
  "Pełny panel analityczny",
  "Dostęp do gotowych szablonów do druku (PDF)",
  "Anulowanie 1-kliknięciem",
];

export const faq = [
  {
    q: "Czy to jest zgodne z zasadami Google?",
    a: "Tak. Nie oferujemy gościom żadnych nagród ani rabatów za opinie i nie filtrujemy ocen. Kierujemy wyłącznie do oficjalnego okna opinii w Google Maps, co jest w pełni zgodne z wytycznymi Google i Dyrektywą Omnibus.",
  },
  {
    q: "Ile czasu zajmuje wdrożenie?",
    a: "Około 5 minut. Wklejasz swój link do opinii Google, generujesz kody QR dla stolików i drukujesz gotowy szablon stojaka w PDF.",
  },
  {
    q: "Czy potrzebuję karty przy rejestracji?",
    a: "Nie. 14 dni testujesz bez karty. Jeśli nie zdecydujesz się kontynuować, konto po prostu wygasa.",
  },
  {
    q: "Czy mogę mieć kilka lokali?",
    a: "Tak, w panelu przełączasz się między lokalami, a statystyki liczone są osobno dla każdego stolika i lokalu.",
  },
];

export function Steps() {
  return (
    <section id="jak-to-dziala" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">
          Trzy kroki i system pracuje za Ciebie
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.title} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                  <s.icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Comparison() {
  return (
    <section className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-3xl font-bold md:text-4xl">Dlaczego DajOpinie?</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Porównanie z typową agencją marketingową obsługującą lokalną gastronomię.
        </p>

        <div className="mt-10 overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-3 bg-secondary text-sm font-semibold">
            <div className="p-4 text-muted-foreground">Kryterium</div>
            <div className="p-4 text-primary">DajOpinie</div>
            <div className="p-4 text-muted-foreground">Droga konkurencja / Agencje</div>
          </div>
          {comparison.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-3 border-t border-border text-sm"
            >
              <div className="p-4 text-muted-foreground">{row.label}</div>
              <div className="flex items-start gap-2 p-4 font-medium">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {row.us}
              </div>
              <div className="flex items-start gap-2 p-4 text-muted-foreground">
                <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                {row.them}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Pricing({ onTrial }: { onTrial: () => void }) {
  return (
    <section id="cennik" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Jeden prosty plan</h2>
        <p className="mt-3 text-muted-foreground">
          Bez ukrytych opłat, bez umów rocznych, bez opłaty wdrożeniowej.
        </p>

        <Card className="mt-10 border-primary/40 bg-card text-left shadow-elevated">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">Plan Gastro Starter</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Wszystko czego potrzebuje jeden lokal
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold text-primary">99 PLN</p>
                <p className="text-xs text-muted-foreground">netto / miesiąc</p>
              </div>
            </div>

            <ul className="mt-8 space-y-3">
              {planFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className="size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              onClick={onTrial}
              className="mt-8 h-12 w-full font-semibold glow-gold"
            >
              Aktywuj 14 dni za darmo (Bez karty)
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="border-t border-border py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold md:text-4xl">Najczęstsze pytania</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faq.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} DajOpinie.pl — Wszelkie prawa zastrzeżone.</p>
        <div className="flex flex-wrap gap-5">
          <a href="#" className="hover:text-foreground">
            Polityka prywatności
          </a>
          <a href="#" className="hover:text-foreground">
            Regulamin
          </a>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-muted-foreground">
        100% zgodne z wytycznymi Google Maps i Dyrektywą Omnibus.
      </p>
    </footer>
  );
}
