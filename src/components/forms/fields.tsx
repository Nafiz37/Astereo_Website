import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, error, hint, required, children, className }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-primary"> *</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}

export const Input = (props: ComponentProps<"input">) => <input {...props} className={cn("field", props.className)} />;
export const Textarea = (props: ComponentProps<"textarea">) => <textarea {...props} className={cn("field min-h-28 resize-y", props.className)} />;

/**
 * Select whose submitted values are always the English option strings (what the API validates),
 * while `labels` lets the visitor see them in their own language.
 */
export function Select({ options, labels, placeholder = "Select…", ...props }: ComponentProps<"select"> & { options: readonly string[]; labels?: Record<string, string>; placeholder?: string }) {
  return (
    <select {...props} className={cn("field appearance-none bg-no-repeat pr-8", props.className)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {labels?.[o] ?? o}
        </option>
      ))}
    </select>
  );
}

/** Hidden anti-bot field. Real users never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
