import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

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

  const handleLoginClick = () => {
    setOpen(false);
    onLogin?.();
  };

  const handleTrialClick = () => {
    setOpen(false);
    onTrial();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        {/* NAWIGACJA DESKTOP */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-all duration-200 hover:text-foreground hover:translate-y-[-1px]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* PRZYCISKI DESKTOP */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            onClick={handleLoginClick}
            className="text-muted-foreground hover:text-foreground"
          >
            Zaloguj się
          </Button>
          <Button
            onClick={handleTrialClick}
            className="font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] glow-gold"
          >
            Wypróbuj 14 dni za darmo
          </Button>
        </div>

        {/* HAMBURGER MOBILE */}
        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ROZWIJANE MENU MOBILE */}
      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" onClick={handleLoginClick}>
              Zaloguj się
            </Button>
            <Button onClick={handleTrialClick} className="font-semibold glow-gold">
              Wypróbuj 14 dni za darmo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}