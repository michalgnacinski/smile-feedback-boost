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
  Plus,
  QrCode,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { TrialExpiredPaywall } from "@/components/dashboard/TrialExpiredPaywall";
import { GoogleReviewsWidget } from "@/components/dashboard/GoogleReviewsWidget";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel Menadżera — DajOpinie" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/5kQ5kD12h8pm8eE17c3Je00";
const STRIPE_CUSTOMER_PORTAL_LINK = "https://billing.stripe.com/p/login/5kQ5kD12h8pm8eE17c3Je00";

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

  // Stan modala tworzenia nowej restauracji
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [creating, setCreating] = useState(false);

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

  // Sprawdzanie czy wróciliśmy z udanej płatności Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");

    if (payment === "success" && dashboardData?.slug) {
      fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          restaurantSlug: dashboardData.slug,
        }),
      })
        .then((r) => r.json())
        .then(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchData(activeSlug);
        });
    }
  }, [dashboardData?.slug]);

  const handleLogout = () => {
    localStorage.removeItem("dajopinie_token");
    window.location.href = "/";
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestaurantName.trim()) return;

    setCreating(true);
    const token = localStorage.getItem("dajopinie_token");

    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ name: newRestaurantName.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Błąd serwera (404/500)" }));
        throw new Error(errData.error || "Błąd zapisu");
      }

      const data = await res.json();

      toast.success(`Lokal "${data.name}" został utworzony!`);
      setNewRestaurantName("");
      setCreateModalOpen(false);

      // Przełączamy na nowy slug i pobieramy dane
      setActiveSlug(data.slug);
    } catch (err: any) {
      toast.error(err.message || "Nie udało się utworzyć lokalu.");
    } finally {
      setCreating(false);
    }
  };

  const scrollToGoogleCard = () => {
    setView("google");
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

        {/* PRZEŁĄCZNIK LOKALU + PRZYCISK DODAWANIA LOKALU */}
        <div className="p-4 flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 justify-between text-xs font-semibold">
                <span className="truncate">
                  {dashboardData?.restaurantName || "Pobieranie lokalu..."}
                </span>
                <ChevronDown className="size-4 shrink-0 opacity-50 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-card border-border">
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

          {/* Przycisk Plusa z Tooltipem */}
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 border-border bg-card hover:bg-primary/20 hover:text-primary transition"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Dodaj lokal
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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

        {/* PRZYCISK WYLOGUJ NA DESKTOP */}
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

      {/* GŁÓWNY KONTENER */}
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
            <div className="mb-4 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-between text-xs font-semibold">
                    <span className="truncate">{dashboardData?.restaurantName}</span>
                    <ChevronDown className="size-4 opacity-50 ml-1" />
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

              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 border-border"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCreateModalOpen(true);
                }}
              >
                <Plus className="size-4" />
              </Button>
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

              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {dashboardData?.restaurantName || "DajOpinie"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {nav.find((n) => n.id === view)?.label}
                </h1>
              </div>
            </div>

            <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 font-semibold text-xs px-3 py-1.5 rounded-lg w-fit shrink-0">
              {dashboardData?.subscription?.status === "TRIAL"
                ? `Okres próbny (zostało ${dashboardData?.subscription?.trialDaysLeft ?? 0} dni)`
                : "Subskrypcja aktywna"}
            </Badge>
          </div>

          {/* JEŚLI TRIAL WYGASŁ I BRAK SUBSKRYPCJI — WYŚWIETL PAYWALL */}
          {dashboardData?.subscription?.isExpired && dashboardData?.subscription?.status !== "ACTIVE" ? (
            <TrialExpiredPaywall
              restaurantName={dashboardData?.restaurantName}
              totalScans={dashboardData?.stats?.totalScans || 0}
              onActivate={() => {
                window.location.href = STRIPE_PAYMENT_LINK;
              }}
            />
          ) : (
            <>
              {/* WIDOK: PANEL ANALITYCZNY */}
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

                  <GoogleReviewsWidget
                    slug={dashboardData?.slug || ""}
                    googleReviewLink={dashboardData?.googleReviewLink}
                  />
                </div>
              )}

              {/* WIDOK: KODY QR I STOLIKI */}
              {view === "tables" && (
                <QrTables
                  restaurantName={dashboardData?.restaurantName}
                  restaurantSlug={dashboardData?.slug}
                  logoUrl={dashboardData?.logoUrl || null}
                  tables={dashboardData?.tables || []}
                  onRefresh={() => fetchData(activeSlug)}
                />
              )}

              {/* WIDOK: PROFIL I GOOGLE LINK */}
              {view === "google" && (
                <div className="max-w-2xl space-y-6">
                  <LogoUploadCard
                    slug={dashboardData?.slug || ""}
                    restaurantName={dashboardData?.restaurantName || ""}
                    initialLogoUrl={dashboardData?.logoUrl || null}
                    onSuccess={() => fetchData(activeSlug)}
                  />

                  <div id="google-link-card">
                    <GoogleLinkCard
                      slug={dashboardData?.slug || ""}
                      initialLink={dashboardData?.googleReviewLink || null}
                      isHighlighted={!dashboardData?.googleReviewLink}
                    />
                  </div>
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

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      {dashboardData?.subscription?.status === "ACTIVE" ? (
                        // Jeśli ma aktywną subskrypcję -> prowadzi do portalu faktur i kart
                        <Button
                          onClick={() => {
                            window.location.href = STRIPE_CUSTOMER_PORTAL_LINK;
                          }}
                          variant="outline"
                          className="font-bold w-full sm:w-auto"
                        >
                          Zarządzaj subskrypcją i pobierz faktury VAT →
                        </Button>
                      ) : (
                        // Jeśli jest w trialu -> prowadzi do opłacenia
                        <Button
                          onClick={() => {
                            window.location.href = STRIPE_PAYMENT_LINK;
                          }}
                          className="font-bold w-full sm:w-auto glow-gold"
                        >
                          Aktywuj subskrypcję (99 PLN / msc)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL DODAWANIA NOWEGO LOKALU */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj nowy lokal</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Podaj nazwę dla nowego lokalu lub oddziału.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRestaurant} className="space-y-4 pt-2">
            <Input
              placeholder="np. KFC Galeria Krakowska"
              value={newRestaurantName}
              onChange={(e) => setNewRestaurantName(e.target.value)}
              disabled={creating}
              autoFocus
            />
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={creating || !newRestaurantName.trim()}>
                {creating ? "Tworzenie..." : "Dodaj lokal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}