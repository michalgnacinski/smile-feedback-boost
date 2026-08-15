import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Regulamin Serwisu — DajOpinie" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold gap-1">
            <a href="/"><ArrowLeft className="size-3.5" /> Powrót</a>
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Regulamin Świadczenia Usług
        </h1>
        <p className="text-xs text-muted-foreground">Ostatnia aktualizacja: 15 sierpnia 2026 r.</p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">§ 1. Postanowienia ogólne</h2>
          <p>1. Niniejszy Regulamin określa zasady korzystania z aplikacji internetowej DajOpinie (https://dajopinie.com.pl).</p>
          <p>2. Usługa skierowana jest do podmiotów prowadzących działalność gospodarczą (B2B) – restauracji, kawiarni oraz punktów gastronomicznych.</p>
          <p>3. Kontakt z Usługodawcą możliwy jest pod adresem e-mail: kontakt@dajopinie.com.pl.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">§ 2. Zakres usług</h2>
          <p>1. Serwis świadczy usługi w modelu SaaS umożliwiając generowanie kodów QR dla stolików, przekierowywanie gości do wizytówki Google oraz zbieranie analityki wejść.</p>
          <p>2. DajOpinie nie ingeruje w treść opinii gości ani nie gwarantuje konkretnej liczby wystawionych ocen.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">§ 3. Okres Próbny i Subskrypcja</h2>
          <p>1. Każdy nowy lokal otrzymuje 14-dniowy, darmowy okres próbny bez konieczności podawania karty.</p>
          <p>2. Po zakończeniu okresu próbnego opłata wynosi 99 PLN netto / miesiąc za lokal. Płatności i faktury VAT obsługiwane są przez firmę Stripe.</p>
          <p>3. Użytkownik może w każdej chwili anulować subskrypcję za pośrednictwem Panelu Klienta Stripe.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">§ 4. Reklamacje</h2>
          <p>Zgłoszenia reklamacyjne i pytania techniczne prosimy kierować na adres: kontakt@dajopinie.com.pl.</p>
        </section>
      </main>
    </div>
  );
}