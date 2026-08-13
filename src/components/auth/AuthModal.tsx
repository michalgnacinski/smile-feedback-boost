import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const API_BASE = "http://localhost:3001";
    const endpoint = mode === "register" ? `${API_BASE}/api/auth/register` : `${API_BASE}/api/auth/login`;

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

      // 👈 ZAPAMIĘTUJEMY TOKEN W PRZEGLĄDARCE:
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
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {mode === "register" ? (
              <>
                Wypróbuj{" "}
                <span className="text-primary font-extrabold drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                  DajOpinie
                </span>{" "}
                14 dni za darmo
              </>
            ) : (
              <>
                Zaloguj się do{" "}
                <span className="text-primary font-extrabold drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
                  DajOpinie
                </span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-xs">
            {mode === "register"
              ? "Bez podawania karty kredytowej. Konfiguracja w 60 sekund."
              : "Wpisz swoje dane, aby przejść do zarządzenia opiniami."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="restaurantName" className="text-xs">
                Nazwa Twojej Restauracji / Lokalu
              </Label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="restaurantName"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="np. Pizzeria La Torre"
                  className="pl-9 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Adres E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="wlasciciel@restauracja.pl"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">
              Hasło
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 text-sm"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full font-bold h-11 glow-gold mt-2"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : mode === "register" ? (
              "Rozpocznij darmowy test"
            ) : (
              "Zaloguj się"
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-border mt-3 text-xs text-muted-foreground">
          {mode === "register" ? (
            <p>
              Masz już konto?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-primary font-semibold hover:underline"
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
                className="text-primary font-semibold hover:underline"
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