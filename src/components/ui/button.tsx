import Link from "@/components/ui/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variants = {
  primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.6)]",
  outline: "border border-primary/60 text-primary hover:bg-primary/10",
  ghost: "border border-border/60 text-foreground hover:bg-secondary/60",
  subtle: "bg-secondary text-foreground hover:bg-muted",
} as const;
const sizes = { sm: "h-9 px-4", md: "h-11 px-6", lg: "h-12 px-8 text-base" } as const;

type Common = { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string };

export function Button({ variant = "primary", size = "md", className, ...props }: Common & ComponentProps<"button">) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
