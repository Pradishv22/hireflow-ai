import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TextFieldProps = ComponentProps<"input"> & { label: string; hint?: string };

export function TextField({ label, hint, className, id, ...props }: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-primary focus:ring-2 focus:ring-primary/15",
          className,
        )}
        {...props}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
