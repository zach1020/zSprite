import { cn } from "@/lib/utils";

type ProgressProps = {
  className?: string;
  value: number;
};

export function Progress({ className, value }: ProgressProps) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-[width]"
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
      />
    </div>
  );
}
