import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  QrCode,
  X,
  Store,
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
import { Overview } from "@/components/dashboard/Overview";
import { GoogleLinkCard } from "@/components/dashboard/GoogleLinkCard";
import { QrTables } from "@/components/dashboard/QrTables";
import { getRestaurantDashboardData } from "@/lib/services/dashboard";
import { LogoUploadCard } from "@/components/dashboard/LogoUploadCard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel Menadżera — DajOpinie" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const nav = [
  { id: "overview", label: "Panel Analityczny", icon: LayoutDashboard },
  { id: "tables", label: "Kody QR i Stojaki", icon: QrCode },
  { id: "google", label: "Profil & Google Link", icon: Link2 },
  { id: "billing", label: "Płatności", icon: CreditCard },
];

export function Dashboard() {
  const [view, setView] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchData = (slug?: string | null) => {
    setLoading(true);
    getRestaurantDashboardData({ data: slug || undefined })
      .then((res) => {
        setDashboardData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Błąd pobierania danych");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(activeSlug);
  }, [activeSlug]);

  const handleLogout = () => {
    localStorage.removeItem("dajopinie_token");
    window.location.href = "/";
  };

  const scrollToGoogleCard = () => {
    setView("overview");
    setTimeout(() => {
      const element = document.getElementById("google-link-card");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Ładowanie danych panelu...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* SIDEBAR DLA DESKTOPU */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Logo />
        </div>

        {/* PRZEŁĄCZNIK LOKALU */}
        <div className="p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between text-xs font-semibold">
                <span className="truncate">
                  {dashboardData?.restaurantName || "Pobieranie lokalu..."}
                </span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-card border-border">
              {dashboardData?.userRestaurants && dashboardData.userRestaurants.length > 0 ? (
                dashboardData.userRestaurants.map((rest: { name: string; slug: string }) => (
                  <DropdownMenuItem
                    key={rest.slug}
                    onSelect={() => setActiveSlug(rest.slug)}
                    className="text-xs cursor-pointer"
                  >
                    {rest.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="text-xs">
                  Brak innych lokali
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* NAWIGACJA DESKTOP */}
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* PRZYCISK WYLOGUJ NA DESKTOP (PRZYPIĘTY NA DOLE) */}
        <div className="p-4 border-t border-border mt-auto">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
          >
            <LogOut className="size-4" />
            Wyloguj się
          </Button>
        </div>
      </aside>

      {/* GŁÓWNA KONTENERA DANYCH */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* NAGŁÓWEK MOBILNY */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </header>

        {/* ROZWIJANE MENU MOBILNE */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card px-4 py-4 lg:hidden animate-in fade-in slide-in-from-top-2">
            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between text-xs font-semibold">
                    <span className="truncate">{dashboardData?.restaurantName}</span>
                    <ChevronDown className="size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-full bg-card border-border">
                  {dashboardData?.userRestaurants?.map((rest: { name: string; slug: string }) => (
                    <DropdownMenuItem
                      key={rest.slug}
                      onSelect={() => {
                        setActiveSlug(rest.slug);
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs"
                    >
                      {rest.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <nav className="flex flex-col gap-1">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* WYLOGUJ W MENU MOBILNYM */}
            <div className="mt-4 pt-3 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
              >
                <LogOut className="size-4" />
                Wyloguj się
              </Button>
            </div>
          </div>
        )}

        {/* GŁÓWNA ZAWARTOŚĆ STRONY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {/* NAGŁÓWEK DANEGO WIDOKU */}
          <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div className="flex items-center gap-4">
              {/* POWIĘKSZONE LOGO / AVATAR LOKALU (56px) */}
              <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl border border-border bg-slate-900/90 p-2 shadow-md shrink-0 ring-1 ring-white/10">
                {dashboardData?.logoUrl ? (
                  <img
                    src={dashboardData.logoUrl}
                    alt={`Logo — ${dashboardData.restaurantName}`}
                    className="h-full w-full object-contain rounded-xl"
                  />
                ) : (
                  <Store className="size-7 text-primary" />
                )}
              </div>

              {/* WYRAŹNY TYTUŁ I SUBSCRIPT LOGO */}
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {dashboardData?.restaurantName || "DajOpinie"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {nav.find((n) => n.id === view)?.label}
                </h1>
              </div>
            </div>

            {/* BADGE SUBSKRYPCJI W JEDNEJ LINII */}
            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 font-semibold text-xs px-3 py-1.5 rounded-lg w-fit shrink-0">
              {dashboardData?.subscription?.status === "TRIAL"
                ? `Okres próbny (zostało ${dashboardData?.subscription?.trialDaysLeft ?? 0} dni)`
                : "Subskrypcja aktywna"}
            </Badge>
          </div>
          

          {/* WIDOK: PRZEGLĄD */}
          {view === "overview" && (
            <div className="space-y-6">
              {!dashboardData?.googleReviewLink && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white">
                        Brak skonfigurowanego linku Google Maps!
                      </h4>
                      <p className="text-[11px] sm:text-xs text-amber-200/80">
                        Twój system QR nie może przekierowywać gości, dopóki nie wkleisz linku do profilu firmy.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={scrollToGoogleCard}
                    className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs shrink-0 glow-gold"
                  >
                    Uzupełnij link teraz →
                  </Button>
                </div>
              )}

              <Overview stats={dashboardData?.stats} chartData={dashboardData?.chartData} />

              <GoogleLinkCard
                slug={dashboardData?.slug || ""}
                initialLink={dashboardData?.googleReviewLink || null}
                isHighlighted={!dashboardData?.googleReviewLink}
              />
            </div>
          )}

          {/* WIDOK: KODY QR I STOLIKI */}
          {view === "tables" && (
            <QrTables
              restaurantName={dashboardData?.restaurantName}
              restaurantSlug={dashboardData?.slug}
              tables={dashboardData?.tables || []}
              onRefresh={() => fetchData(activeSlug)}
            />
          )}

          {/* WIDOK: USTAWIENIA GOOGLE LINK */}
          {view === "google" && (
            <div className="max-w-2xl space-y-6">
              {/* KARTA LOGO RESTAURACJI */}
              <LogoUploadCard
                slug={dashboardData?.slug || ""}
                restaurantName={dashboardData?.restaurantName || ""}
                initialLogoUrl={dashboardData?.logoUrl || null}
                onSuccess={() => fetchData(activeSlug)}
              />

              {/* KARTA LINKU GOOGLE MAPS */}
              <GoogleLinkCard
                slug={dashboardData?.slug || ""}
                initialLink={dashboardData?.googleReviewLink || null}
                isHighlighted={!dashboardData?.googleReviewLink}
              />
            </div>
          )}

          {/* WIDOK: PŁATNOŚCI */}
          {view === "billing" && (
            <Card className="border-border bg-card max-w-xl">
              <CardHeader>
                <CardTitle className="text-base">Płatności i subskrypcja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold">Gastro Starter — 99 PLN netto / msc</span>
                </div>

                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-primary text-primary-foreground font-semibold text-xs">
                    {dashboardData?.subscription?.status === "TRIAL"
                      ? `Okres próbny (zostało ${dashboardData?.subscription?.trialDaysLeft ?? 0} dni)`
                      : "Aktywna subskrypcja"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pierwsze obciążenie</span>
                  <span className="font-semibold">
                    {dashboardData?.subscription?.trialEndsAt
                      ? new Date(dashboardData.subscription.trialEndsAt).toLocaleDateString("pl-PL")
                      : "—"}
                  </span>
                </div>

                <Button className="mt-2 font-bold w-full sm:w-auto glow-gold">
                  Dodaj metodę płatności
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}