import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Adds `is-visible` once the element scrolls into the viewport (once only). */
export function useInView<T extends HTMLElement>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin, threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, visible };
}

type Direction = "up" | "left" | "right";

const base: Record<Direction, string> = {
  up: "reveal",
  left: "reveal-left",
  right: "reveal-right",
};

export function Reveal({
  children,
  from = "up",
  delay = 0,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  from?: Direction;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return (
    <As
      ref={ref as never}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(base[from], visible && "is-visible", className)}
    >
      {children}
    </As>
  );
}
