import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils.js";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-white/10 bg-slate-900/65 p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.8)] backdrop-blur-xl",
      className,
    )}
    {...props}
  />
);
