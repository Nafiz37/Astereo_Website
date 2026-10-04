"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toBanglaDigits } from "@/i18n/config";

/** Counts up to `value` once visible. Shows the final value immediately for reduced-motion users. */
export function Counter({ value, suffix = "", decimals = 0, bangla = false }: { value: number; suffix?: string; decimals?: number; bangla?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 1.4, ease: "easeOut", onUpdate: setN });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const shown = reduce ? value : n;
  return (
    <span ref={ref} aria-label={`${value}${suffix}`}>
      {bangla ? toBanglaDigits(shown.toFixed(decimals)) : shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
