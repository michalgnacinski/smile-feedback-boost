import { useEffect, useState } from "react";
import { LayoutDashboard, ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

interface HeaderProps {
  onTrial: () => void;
  onLogin?: () => void;
}

const links = [
  { href: "#jak-to-dziala", label: "Jak to działa" },
  { href: "#cennik", label: "Cennik" },
  { href: "#faq", label: "FAQ" },
];

export function Header({ onTrial, onLogin }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("dajopinie_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginClick = () => {
    setOpen(false);
    onLogin?.();
  };

  const handleTrialClick = () => {
    setOpen(false);
    onTrial();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      {/* 🚀 STATYCZNY BANER DLA ZALOGOWANEGO UŻYTKOWNIKA */}
      {isLoggedIn && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold truncate pr-2">
            <LayoutDashboard className="size-4 shrink-0" />
            <span className="truncate">Jesteś zalogowany do panelu</span>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs font-bold gap-1 glow-gold shrink-0"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Otwórz panel <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        {/* NAWIGACJA DESKTOP */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* PRZYCISKI DESKTOP */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="font-bold glow-gold"
            >
              Przejdź do Panelu →
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={handleLoginClick}
                className="text-muted-foreground hover:text-foreground"
              >
                Zaloguj się
              </Button>
              <Button
                onClick={handleTrialClick}
                className="font-semibold glow-gold"
              >
                Wypróbuj 14 dni za darmo
              </Button>
            </>
          )}
        </div>

        {/* HAMBURGER MOBILE */}
        <button
          className="md:hidden p-2 text-foreground"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* ROZWIJANE MENU MOBILE */}
      {open && (
        <div className="border-t border-border bg-card px-4 py-5 md:hidden space-y-4 shadow-xl">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-1"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <Button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full font-bold glow-gold"
              >
                Przejdź do Panelu →
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleLoginClick} className="w-full">
                  Zaloguj się
                </Button>
                <Button onClick={handleTrialClick} className="w-full font-semibold glow-gold">
                  Wypróbuj 14 dni za darmo
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}