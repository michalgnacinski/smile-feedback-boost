import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  Link2,
  Menu,
  QrCode,
  Star,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoogleLinkCard } from "@/components/dashboard/GoogleLinkCard";
import { Overview } from "@/components/dashboard/Overview";
import { QrTables } from "@/components/dashboard/QrTables";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { restaurants } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const title = "Panel restauratora — DajOpinie";
const description =
  "Śledź skany kodów QR, konwersję na opinie w Google i zarządzaj stojakami dla swoich stolików.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Dashboard,
});

type View = "overview" | "qr" | "google" | "billing";

const nav: { id: View; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Przegląd", icon: BarChart3 },
  { id: "qr", label: "Kody QR i Stojaki", icon: QrCode },
  { id: "google", label: "Ustawienia Google Link", icon: Link2 },
  { id: "billing", label: "Płatności", icon: CreditCard },
];

function Dashboard() {
  const [view, setView] = useState<View>("overview");
  const [restaurant, setRestaurant] = useState(restaurants[0]!);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "rise-in border-b border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r",
        )}
      >

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <button
            className="lg:hidden"
            aria-label="Menu panelu"
            onClick={() => setNavOpen((v) => !v)}
          >
            <Menu className="size-5" />
          </button>
        </div>

        <div className="px-4 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{restaurant.name}</span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {restaurants.map((r) => (
                <DropdownMenuItem key={r.id} onSelect={() => setRestaurant(r)}>
                  {r.name}
                  <span className="ml-auto text-xs text-muted-foreground">{r.city}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className={cn("px-3 pb-4", navOpen ? "block" : "hidden lg:block")}>
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setNavOpen(false);
              }}
              className={cn(
                "mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                view === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-4 py-6 pb-24 md:px-8">
        <header className="rise-in mb-6 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "60ms" }}>
          <div>
            <h1 className="text-2xl font-bold">{nav.find((n) => n.id === view)?.label}</h1>
            <p className="text-sm text-muted-foreground">
              {restaurant.name} · {restaurant.city}
            </p>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">
            Okres próbny · 9 dni
          </Badge>
        </header>

        {view === "overview" && (
          <div className="space-y-6">
            <Overview />
            <GoogleLinkCard />
            <QrTables restaurantName={restaurant.name} />
          </div>
        )}

        {view === "qr" && <QrTables restaurantName={restaurant.name} />}
        {view === "google" && <GoogleLinkCard />}


        {view === "billing" && (
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Płatności</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">Gastro Starter — 99 PLN netto / msc</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                  Okres próbny (zostało 9 dni)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pierwsze obciążenie</span>
                <span className="font-medium">21.08.2026</span>
              </div>
              <Button className="mt-2 font-semibold">Dodaj metodę płatności</Button>
            </CardContent>
          </Card>
        )}
      </main>

      <ViewSwitcher />
    </div>
  );
}
