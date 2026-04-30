import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-[color:var(--border)] bg-white/6 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[color:var(--accent)] focus:bg-white/8",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
