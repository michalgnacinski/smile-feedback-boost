import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "login" | "register";
}

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "register",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [loading, setLoading] = useState(false);

  // Stany formularza
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setRestaurantName("");
      setEmail("");
      setPassword("");
    }
  }, [open, initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";

    const payload =
      mode === "register"
        ? { restaurantName, email, password }
        : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Wystąpił błąd");
      }

      if (data.token) {
        localStorage.setItem("dajopinie_token", data.token);
      }

      toast.success(
        mode === "register"
          ? "Konto i restauracja zostały utworzone!"
          : "Zalogowano pomyślnie!"
      );

      onOpenChange(false);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-2xl overflow-hidden">
        <DialogHeader className="space-y-1.5 text-left pr-6">
          <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {mode === "register" ? (
              <>
                Wypróbuj{" "}
                <span className="text-primary font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  DajOpinie
                </span>{" "}
                14 dni za darmo
              </>
            ) : (
              <>
                Zaloguj się do{" "}
                <span className="text-primary font-black drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  DajOpinie
                </span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            {mode === "register"
              ? "Bez podawania karty kredytowej. Konfiguracja w 60 sekund."
              : "Wpisz swoje dane, aby przejść do panelu menadżera."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {mode === "register" && (
            <div className="space-y-1">
              <Label htmlFor="restaurantName" className="text-xs font-medium text-foreground">
                Nazwa Twojej Restauracji / Lokalu
              </Label>
              <div className="relative flex items-center">
                <Store className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="restaurantName"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="np. Pizzeria La Torre"
                  className="pl-9 text-xs sm:text-sm h-10 w-full bg-background/50"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Adres E-mail
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="wlasciciel@restauracja.pl"
                className="pl-9 text-xs sm:text-sm h-10 w-full bg-background/50"
                autoFocus={mode === "login"}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              Hasło
            </Label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 text-xs sm:text-sm h-10 w-full bg-background/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold h-10 sm:h-11 text-xs sm:text-sm glow-gold mt-2 transition-all"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : mode === "register" ? (
              "Rozpocznij darmowy test"
            ) : (
              "Zaloguj się"
            )}
          </Button>
        </form>

        <div className="text-center pt-3 border-t border-border mt-2 text-xs text-muted-foreground">
          {mode === "register" ? (
            <p>
              Masz już konto?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary font-bold hover:underline ml-1"
              >
                Zaloguj się
              </button>
            </p>
          ) : (
            <p>
              Nie masz jeszcze konta?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-primary font-bold hover:underline ml-1"
              >
                Załóż konto i przetestuj 14 dni
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}