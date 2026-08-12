import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const views = [
  { to: "/", label: "Landing" },
  { to: "/r/pizzeria-la-torre-01", label: "Skan QR" },
  { to: "/dashboard", label: "Panel" },
] as const;

export function ViewSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 text-xs shadow-elevated backdrop-blur">
        {views.map((v) => (
          <Link
            key={v.to}
            to={v.to}
            className={cn(
              "rounded-full px-3 py-1.5 font-medium transition-colors",
              pathname === v.to
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
