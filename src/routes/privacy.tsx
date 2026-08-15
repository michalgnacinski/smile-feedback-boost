import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Polityka Prywatności — DajOpinie" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* NAGŁÓWEK */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold gap-1.5">
            <a href="/">
              <ArrowLeft className="size-3.5" /> Powrót do strony głównej
            </a>
          </Button>
        </div>
      </header>

      {/* GŁÓWNA TREŚĆ */}
      <main className="max-w-3xl mx-auto px-4 py-10 sm:py-14 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <div className="space-y-2 border-b border-border/60 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
            <ShieldCheck className="size-4" />
            <span>Dokument Prawny</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Polityka Prywatności
          </h1>
          <p className="text-xs text-muted-foreground">
            Serwis internetowy: <strong className="text-foreground">https://www.dajopinie.com.pl/</strong>
          </p>
        </div>

        {/* SEKCJA 1 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">1. Informacje ogólne</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Niniejsza polityka dotyczy Serwisu www, funkcjonującego pod adresem URL:{" "}
              <strong className="text-foreground">https://www.dajopinie.com.pl/</strong>.
            </li>
            <li>
              Operatorem serwisu oraz Administratorem danych osobowych jest:{" "}
              <strong className="text-foreground">DajOpinie, os. Zwycięstwa, 61-650 Poznań</strong>.
            </li>
            <li>
              Adres kontaktowy poczty elektronicznej operatora:{" "}
              <a href="mailto:michal.gnacinski2006@gmail.com" className="text-primary hover:underline font-medium">
                michal.gnacinski2006@gmail.com
              </a>.
            </li>
            <li>
              Operator jest Administratorem Twoich danych osobowych w odniesieniu do danych podanych dobrowolnie w Serwisie.
            </li>
            <li>
              Serwis wykorzystuje dane osobowe w następujących celach:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Prowadzenie newslettera oraz komunikacji transakcyjnej związanej z działaniem usługi.</li>
              </ul>
            </li>
            <li>
              Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniu w następujący sposób:
              <ol className="list-[lower-alpha] pl-5 mt-1 space-y-1">
                <li>Poprzez dobrowolnie wprowadzone w formularzach dane, które zostają wprowadzone do systemów Operatora.</li>
                <li>Poprzez zapisywanie w urządzeniach końcowych plików cookie (tzw. „ciasteczka”).</li>
              </ol>
            </li>
          </ol>
        </section>

        {/* SEKCJA 2 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">2. Wybrane metody ochrony danych stosowane przez Operatora</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Hasła użytkowników są przechowywane w postaci hashowanej. Funkcja hashująca działa jednokierunkowo – nie jest możliwe odwrócenie jej działania, co stanowi współczesny standard w zakresie bezpiecznego przechowywania haseł.
            </li>
            <li>
              W serwisie jest stosowana autentykacja dwuskładnikowa, co stanowi dodatkową formę ochrony logowania do Serwisu.
            </li>
            <li>
              Istotnym elementem ochrony danych jest regularna aktualizacja wszelkiego oprogramowania wykorzystywanego przez Operatora do przetwarzania danych osobowych, w szczególności regularne aktualizacje komponentów programistycznych.
            </li>
          </ol>
        </section>

        {/* SEKCJA 3 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">3. Hosting</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Serwis jest hostowany (technicznie utrzymywany) na serwerach operatora: <strong className="text-foreground">hostido.pl</strong>.</li>
            <li>
              Firma hostingowa w celu zapewnienia niezawodności technicznej prowadzi logi na poziomie serwera. Zapisowi mogą podlegać:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>zasoby określone identyfikatorem URL (adresy żądanych zasobów – stron, plików),</li>
                <li>czas nadejścia zapytania i czas wysłania odpowiedzi,</li>
                <li>nazwę stacji klienta – identyfikacja realizowana przez protokół HTTP,</li>
                <li>informacje o błędach, jakie nastąpiły przy realizacji transakcji HTTP,</li>
                <li>adres URL strony poprzednio odwiedzanej przez użytkownika (referer link) – w przypadku, gdy przejście nastąpiło przez odnośnik,</li>
                <li>informacje o przeglądarce użytkownika oraz adresie IP,</li>
                <li>informacje diagnostyczne związane z procesem samodzielnego zamawiania usług poprzez formularze na stronie,</li>
                <li>informacje związane z obsługą poczty elektronicznej kierowanej do Operatora oraz wysyłanej przez Operatora.</li>
              </ul>
            </li>
          </ol>
        </section>

        {/* SEKCJA 4 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">4. Twoje prawa i dodatkowe informacje o sposobie wykorzystania danych</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              W niektórych sytuacjach Administrator ma prawo przekazywać Twoje dane osobowe innym odbiorcom, jeśli będzie to niezbędne do wykonania zawartej z Tobą umowy lub do zrealizowania obowiązków ciążących na Administratorze. Dotyczy to następujących grup odbiorców:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>operatorzy płatności,</li>
                <li>upoważnieni pracownicy i współpracownicy, którzy korzystają z danych w celu realizacji działania strony.</li>
              </ul>
            </li>
            <li>
              Twoje dane osobowe przetwarzane są przez Administratora nie dłużej, niż jest to konieczne do wykonania związanych z nimi czynności określonych osobnymi przepisami (np. o prowadzeniu rachunkowości). W odniesieniu do danych marketingowych dane nie będą przetwarzane dłużej niż przez 3 lata.
            </li>
            <li>
              Przysługuje Ci prawo żądania od Administratora:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>dostępu do danych osobowych Ciebie dotyczących,</li>
                <li>ich sprostowania,</li>
                <li>usunięcia,</li>
                <li>ograniczenia przetwarzania,</li>
                <li>oraz przenoszenia danych.</li>
              </ul>
            </li>
            <li>
              Przysługuje Ci prawo do złożenia sprzeciwu wobec przetwarzania danych osobowych w celu wykonania prawnie uzasadnionych interesów realizowanych przez Administratora, w tym profilowania.
            </li>
            <li>
              Na działania Administratora przysługuje skarga do Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2, 00-193 Warszawa.
            </li>
            <li>Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi Serwisu.</li>
            <li>
              W stosunku do Ciebie mogą być podejmowane czynności polegające na zautomatyzowanym podejmowaniu decyzji, w tym profilowaniu w celu świadczenia usług w ramach zawartej umowy oraz marketingu bezpośredniego.
            </li>
            <li>
              Dane osobowe mogą być przekazywane do krajów trzecich poza Europejski Obszar Gospodarczy w oparciu o odpowiednie zabezpieczenia prawne (np. standardowe klauzule umowne).
            </li>
          </ol>
        </section>

        {/* SEKCJA 5 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">5. Informacje w formularzach</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Serwis zbiera informacje podane dobrowolnie przez użytkownika, w tym dane osobowe, o ile zostaną one podane.</li>
            <li>Serwis może zapisać informacje o parametrach połączenia (oznaczenie czasu, adres IP).</li>
            <li>
              Serwis, w niektórych wypadkach, może zapisać informację ułatwiającą powiązanie danych w formularzu z adresem e-mail użytkownika wypełniającego formularz.
            </li>
            <li>
              Dane podane w formularzu są przetwarzane w celu wynikającym z funkcji konkretnego formularza, np. w celu dokonania procesu obsługi zgłoszenia, rejestracji konta lub kontaktu handlowego.
            </li>
          </ol>
        </section>

        {/* SEKCJA 6 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">6. Logi Administratora</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Informacje o zachowaniu użytkowników w serwisie mogą podlegać logowaniu. Dane te są wykorzystywane wyłącznie w celu administrowania serwisem i zapewnienia jego stabilności.
            </li>
          </ol>
        </section>

        {/* SEKCJA 7 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">7. Istotne techniki marketingowe</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Operator stosuje analizę statystyczną ruchu na stronie poprzez Google Analytics (Google Inc. z siedzibą w USA). Operator nie przekazuje do operatora tej usługi danych osobowych, a jedynie zanonimizowane informacje. Usługa bazuje na wykorzystaniu ciasteczek w urządzeniu końcowym użytkownika. Informacje o preferencjach gromadzonych przez sieć reklamową Google można edytować pod adresem:{" "}
              <a
                href="https://www.google.com/ads/preferences/"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline break-all"
              >
                https://www.google.com/ads/preferences/
              </a>.
            </li>
          </ol>
        </section>

        {/* SEKCJA 8 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">8. Informacja o plikach cookies</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Serwis korzysta z plików cookies.</li>
            <li>
              Pliki cookies (tzw. „ciasteczka”) stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w urządzeniu końcowym Użytkownika Serwisu i przeznaczone są do korzystania ze stron internetowych Serwisu.
            </li>
            <li>Podmiotem zamieszczającym na urządzeniu końcowym Użytkownika pliki cookies oraz uzyskującym do nich dostęp jest operator Serwisu.</li>
            <li>
              Pliki cookies wykorzystywane są w następujących celach:
              <ol className="list-[lower-alpha] pl-5 mt-1 space-y-1">
                <li>utrzymanie sesji użytkownika Serwisu (po zalogowaniu), dzięki której użytkownik nie musi na każdej podstronie ponownie wpisywać loginu i hasła;</li>
                <li>realizacji celów analitycznych i statystycznych.</li>
              </ol>
            </li>
            <li>
              W ramach Serwisu stosowane są dwa zasadnicze rodzaje plików cookies: „sesyjne” (session cookies) oraz „stałe” (persistent cookies).
            </li>
            <li>
              Przeglądarki internetowe zazwyczaj domyślnie dopuszczają przechowywanie plików cookies. Użytkownicy Serwisu mogą dokonać zmiany ustawień w tym zakresie lub usunąć pliki cookies ręcznie.
            </li>
            <li>
              Ograniczenia stosowania plików cookies mogą wpłynąć na niektóre funkcjonalności dostępne na stronach internetowych Serwisu.
            </li>
          </ol>
        </section>

        {/* SEKCJA 9 */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">9. Zarządzanie plikami cookies – jak wyrażać i cofać zgodę?</h2>
          <p>
            Jeśli użytkownik nie chce otrzymywać plików cookies, może zmienić ustawienia przeglądarki. Szczegółowe instrukcje zarządzania plikami cookies dla popularnych przeglądarek:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 transition text-center font-semibold text-foreground"
            >
              Google Chrome
            </a>
            <a
              href="https://support.mozilla.org/pl/kb/wlaczanie-i-wylaczanie-ciasteczek-wlaczone"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 transition text-center font-semibold text-foreground"
            >
              Mozilla Firefox
            </a>
            <a
              href="https://support.microsoft.com/pl-pl/microsoft-edge"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 transition text-center font-semibold text-foreground"
            >
              Microsoft Edge
            </a>
            <a
              href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 transition text-center font-semibold text-foreground"
            >
              Safari (macOS/iOS)
            </a>
            <a
              href="https://help.opera.com/pl/latest/web-preferences/#cookies"
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/50 transition text-center font-semibold text-foreground"
            >
              Opera
            </a>
          </div>
        </section>
      </main>

      {/* STOPKA */}
      <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted-foreground bg-card/30">
        <p>© {new Date().getFullYear()} DajOpinie. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}