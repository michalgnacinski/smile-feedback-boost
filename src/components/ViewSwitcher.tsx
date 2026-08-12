import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const linkClass = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 font-medium transition-all duration-200",
    active
      ? "bg-primary text-primary-foreground shadow-gold"
      : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
  );

export function ViewSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(true);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
        {open ? (
          <div className="rise-in flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-1 text-xs shadow-elevated backdrop-blur-xl">
            <Link to="/" className={linkClass(pathname === "/")}>
              Landing
            </Link>
            <Link
              to="/r/$slug"
              params={{ slug: "pizzeria-la-torre-stolik01" }}
              className={linkClass(pathname.startsWith("/r/"))}
            >
              Skan QR
            </Link>
            <Link to="/dashboard" className={linkClass(pathname === "/dashboard")}>
              Panel
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Ukryj przełącznik widoków"
                  onClick={() => setOpen(false)}
                  className="ml-1 grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Ukryj pasek podglądu</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Pokaż przełącznik widoków"
                onClick={() => setOpen(true)}
                className="press grid size-9 place-items-center rounded-full border border-border/60 bg-card/70 text-muted-foreground shadow-elevated backdrop-blur-xl transition-colors hover:text-foreground"
              >
                <ChevronUp className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Pokaż pasek podglądu</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}