import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const linkClass = (active: boolean) =>
  cn(
    "rounded-full px-3 py-1.5 font-medium transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
  );

export function ViewSwitcher() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 text-xs shadow-elevated backdrop-blur">
        <Link to="/" className={linkClass(pathname === "/")}>
          Landing
        </Link>
        <Link
          to="/r/$slug"
          params={{ slug: "pizzeria-la-torre-01" }}
          className={linkClass(pathname.startsWith("/r/"))}
        >
          Skan QR
        </Link>
        <Link to="/dashboard" className={linkClass(pathname === "/dashboard")}>
          Panel
        </Link>
      </div>
    </div>
  );
}
