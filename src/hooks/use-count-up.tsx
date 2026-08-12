import { useEffect, useRef, useState } from "react";

/** Animates a number from 0 to `target` on mount. */
export function useCountUp(target: number, duration = 1100, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    let start = 0;
    const timeout = window.setTimeout(() => {
      const step = (t: number) => {
        if (!start) start = t;
        const p = Math.min((t - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(target * eased);
        if (p < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export function CountUpText({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  delay = 0,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
}) {
  const v = useCountUp(value, 1100, delay);
  return (
    <>
      {prefix}
      {v.toLocaleString("pl-PL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}
