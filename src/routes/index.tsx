import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Comparison, Faq, Footer, Pricing, Steps, faq } from "@/components/landing/Sections";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://dajopinie.com.pl";
const title = "Więcej opinii Google dla restauracji | DajOpinie";
const description =
  "Pasywny system stojaków QR, który kieruje gości prosto do opinii w Google. 99 PLN netto/msc, zero pracy zespołu, 100% zgodne z zasadami Google.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sprawdzenie stanu logowania w przeglądarce
  useEffect(() => {
    const token = localStorage.getItem("dajopinie_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Otwiera modal w trybie Rejestracji (14 dni testu)
  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  // Otwiera modal w trybie Logowania
  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* 🚀 BANEREK DLA ZALOGOWANEGO UŻYTKOWNIKA */}
      {isLoggedIn && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between z-50 sticky top-0 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary font-semibold truncate">
            <LayoutDashboard className="size-4 shrink-0" />
            <span className="truncate">Jesteś zalogowany do panelu lokalu</span>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs font-bold gap-1 glow-gold shrink-0"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Otwórz panel <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      <Header onTrial={openRegister} onLogin={openLogin} />
      <Hero onTrial={openRegister} />
      <Steps />
      <Comparison />
      <Pricing onTrial={openRegister} />
      <Faq />
      <Footer />

      {/* JEDYNY GŁÓWNY MODAL OBSŁUGUJĄCY LOGOWANIE I REJESTRACJĘ */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode={authMode}
      />
    </main>
  );
}