import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Comparison, Faq, Footer, Pricing, Steps, faq } from "@/components/landing/Sections";
import { TrialDialog } from "@/components/landing/TrialDialog";
import { ViewSwitcher } from "@/components/ViewSwitcher";

const SITE_URL = "https://smile-feedback-boost.lovable.app";
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
  const [trialOpen, setTrialOpen] = useState(false);
  const openTrial = () => setTrialOpen(true);

  return (
    <main className="min-h-screen bg-background">
      <Header onTrial={openTrial} />
      <Hero onTrial={openTrial} />
      <Steps />
      <Comparison />
      <Pricing onTrial={openTrial} />
      <Faq />
      <Footer />
      <TrialDialog open={trialOpen} onOpenChange={setTrialOpen} />
      <ViewSwitcher />
    </main>
  );
}
