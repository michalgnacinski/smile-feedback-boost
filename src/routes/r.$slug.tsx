import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Star, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleReviewLink } from "@/lib/mock-data";

function parseSlug(slug: string) {
  const match = slug.match(/^(.*)-(\d+)$/);
  const rawName = match?.[1] ?? slug;
  const table = match?.[2] ?? null;
  const name = rawName
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { name, table };
}

export const Route = createFileRoute("/r/$slug")({
  head: ({ params }) => {
    const { name } = parseSlug(params.slug);
    const title = `Oceń ${name} w Google — DajOpinie`;
    const description = `Zostaw szybką opinię o wizycie w ${name}. Zajmuje 5 sekund, bez zakładania konta i bez rejestracji.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: ScanPage,
});


function ScanPage() {
  const { slug } = useParams({ from: "/r/$slug" });
  const { name, table } = parseSlug(slug);
  const [redirecting, setRedirecting] = useState(false);

  const handleClick = () => {
    setRedirecting(true);
    // Mock analytics event before the deep link redirect.
    console.info("[analytics] qr_click", { slug, table, ts: Date.now() });
    window.setTimeout(() => {
      window.location.href = googleReviewLink;
    }, 350);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary">
          <UtensilsCrossed className="size-7 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-bold">{name}</h1>
        {table && <p className="mt-1 text-xs text-muted-foreground">Stolik #{table}</p>}

        <h2 className="mt-8 text-2xl font-extrabold leading-snug">
          Smakowało? Dziękujemy za wizytę! 🍕
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Twoja opinia pomaga naszej małej restauracji rosnąć i docierać do nowych gości.
        </p>

        <Button
          onClick={handleClick}
          disabled={redirecting}
          className="mt-10 h-auto w-full flex-col gap-2 rounded-2xl py-5 text-base font-bold glow-gold pulse-gold"
        >
          <span className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-5 fill-current" />
            ))}
          </span>
          <span>{redirecting ? "Przekierowujemy do Google…" : "Oceń nas w Google"}</span>
        </Button>

        <p className="mt-8 text-xs text-muted-foreground">
          Skanowanie zajmuje 5 sekund. Nie wymagamy zakładania konta.
        </p>
      </div>
    </main>
  );
}
