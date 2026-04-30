import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--accent)] px-4 py-2 text-slate-950 shadow-[0_0_30px_rgba(84,245,197,0.25)] hover:bg-[color:var(--accent-strong)]",
        secondary:
          "border-[color:var(--border)] bg-white/6 px-4 py-2 text-white hover:bg-white/10",
        ghost: "border-transparent bg-transparent px-3 py-2 text-slate-300 hover:bg-white/6 hover:text-white",
        outline:
          "border-[color:var(--border)] bg-transparent px-4 py-2 text-slate-200 hover:border-[color:var(--accent)] hover:bg-white/6",
        danger:
          "border-transparent bg-[color:var(--danger)] px-4 py-2 text-white hover:brightness-110",
      },
      size: {
        default: "",
        sm: "rounded-lg px-3 py-1.5 text-xs",
        lg: "px-5 py-3 text-base",
        icon: "size-10 rounded-xl px-0 py-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
