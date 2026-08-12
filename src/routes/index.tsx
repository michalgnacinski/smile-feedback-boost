import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Comparison, Faq, Footer, Pricing, Steps } from "@/components/landing/Sections";
import { TrialDialog } from "@/components/landing/TrialDialog";
import { ViewSwitcher } from "@/components/ViewSwitcher";

const title = "DajOpinie — więcej opinii Google dla Twojej restauracji";
const description =
  "Pasywny system stojaków QR, który kieruje gości prosto do opinii w Google. 99 PLN netto/msc, zero pracy zespołu, 100% zgodne z zasadami Google.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
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
