import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  CreditCard,
  Link2,
  Loader2,
  Menu,
  QrCode,
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
import { getRestaurantDashboardData } from "@/lib/services/dashboard";
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
  const [navOpen, setNavOpen] = useState(false);

  // Stan dla żywych danych z NeonDB
  const [activeSlug, setActiveSlug] = useState<string>("pizzeria-la-torre");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych z bazy przy załadowaniu oraz po zmianie lokalu
  useEffect(() => {
    getRestaurantDashboardData({ data: activeSlug })
      .then((res) => {
        setDashboardData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Błąd pobierania danych");
        setLoading(false);
      });
  }, [activeSlug]);

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* SIDEBAR */}
      <aside
        className={cn(
          "rise-in border-b border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r"
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

        {/* PRZEŁĄCZNIK LOKALI */}
        <div className="px-4 pb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">
                  {dashboardData?.restaurantName || "Pobieranie lokalu..."}
                </span>
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onSelect={() => setActiveSlug("pizzeria-la-torre")}>
                Pizzeria La Torre
                <span className="ml-auto text-xs text-muted-foreground">Kraków</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* NAWIGACJA BOOCZNA */}
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-4 py-6 pb-24 md:px-8">
        <header className="rise-in mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              {nav.find((n) => n.id === view)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {dashboardData?.restaurantName || "Ładowanie..."} · Kraków
            </p>
          </div>

          {/* JEDEN DYNAMICZNY BADGE Z NEONDB */}
          <Badge className="bg-primary text-primary-foreground font-semibold">
            {dashboardData?.subscription?.status === "TRIAL"
              ? `Okres próbny (zostało ${dashboardData?.subscription?.trialDaysLeft ?? 0} dni)`
              : "Subskrypcja aktywna"}
          </Badge>
        </header>

        {/* EKRAN ŁADOWANIA / BŁĘDU */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Pobieranie statystyk z NeonDB...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
            {error}
          </div>
        ) : (
          <>
            {/* WIDOK: PRZEGLĄD */}
            {view === "overview" && (
              <div className="space-y-6">
                <Overview
                  stats={dashboardData?.stats}
                  chartData={dashboardData?.chartData}
                />
                <GoogleLinkCard
                  initialLink={dashboardData?.googleReviewLink}
                />
                <QrTables
                  restaurantName={dashboardData?.restaurantName}
                  tables={dashboardData?.tables}
                />
              </div>
            )}

            {/* WIDOK: KODY QR */}
            {view === "qr" && (
              <QrTables
                restaurantName={dashboardData?.restaurantName}
                tables={dashboardData?.tables}
              />
            )}

            {/* WIDOK: GOOGLE LINK */}
            {view === "google" && (
              <GoogleLinkCard
                initialLink={dashboardData?.googleReviewLink}
              />
            )}

            {/* WIDOK: PŁATNOŚCI */}
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
                    <Badge className="bg-primary text-primary-foreground font-semibold">
                      {dashboardData?.subscription?.status === "TRIAL"
                        ? `Okres próbny (zostało ${dashboardData?.subscription?.trialDaysLeft ?? 0} dni)`
                        : "Aktywna subskrypcja"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pierwsze obciążenie</span>
                    <span className="font-medium">
                      {dashboardData?.subscription?.trialEndsAt
                        ? new Date(dashboardData.subscription.trialEndsAt).toLocaleDateString("pl-PL")
                        : "—"}
                    </span>
                  </div>

                  <Button className="mt-2 font-semibold">Dodaj metodę płatności</Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <ViewSwitcher />
    </div>
  );
}