import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Comparison, Faq, Footer, Pricing, Steps, faq } from "@/components/landing/Sections";
import { AuthModal } from "@/components/auth/AuthModal";

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

  const openRegister = () => {
    setAuthMode("register");
    setAuthOpen(true);
  };

  const openLogin = () => {
    setAuthMode("login");
    setAuthOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header onTrial={openRegister} onLogin={openLogin} />
      <Hero onTrial={openRegister} />
      <Steps />
      <Comparison />
      <Pricing onTrial={openRegister} />
      <Faq />
      <Footer />

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode={authMode}
      />
    </main>
  );
}