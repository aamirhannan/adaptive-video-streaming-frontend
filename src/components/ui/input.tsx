import * as React from "react";
import { cn } from "../../lib/utils.js";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-400 transition-all focus:border-violet-400/60 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/30",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
