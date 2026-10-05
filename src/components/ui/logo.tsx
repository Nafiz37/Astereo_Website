import { useId } from "react";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(217, 91%, 60%)" />
          <stop offset="1" stopColor="hsl(280, 80%, 50%)" />
        </linearGradient>
      </defs>
      <path d="M16 2L4 8v8c0 7.732 5.268 14.936 12 17 6.732-2.064 12-9.268 12-17V8L16 2z" fill={`url(#${id})`} />
      <path d="M16 8l-6 3v4c0 4.5 3 8.5 6 10 3-1.5 6-5.5 6-10v-4l-6-3zm0 3l3 1.5V15c0 2.5-1.5 5-3 6-1.5-1-3-3.5-3-6v-2.5L16 11z" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

export function Logo({ className, name = "Astareo" }: { className?: string; name?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark />
      <span className="text-lg font-semibold text-foreground">{name}</span>
    </span>
  );
}
