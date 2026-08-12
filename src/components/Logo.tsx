import { Link } from "@tanstack/react-router";
import logoImg from "../assets/dajopinie-logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-white px-3.5 py-1.5 shadow-sm transition-transform hover:scale-105",
        className
      )}
    >
      <img
        src={logoImg}
        alt="DajOpinie — logo"
        className={cn("h-7 w-auto object-contain", imgClassName)}
      />
    </Link>
  );
}