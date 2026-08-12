import logoAsset from "@/assets/dajopinie-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg bg-brand-surface px-2.5 py-1.5",
        className,
      )}
    >
      <img
        src={logoAsset.url}
        alt="DajOpinie — logo"
        width={820}
        height={188}
        className={cn("h-5 w-auto", imgClassName)}
      />
    </span>
  );
}
