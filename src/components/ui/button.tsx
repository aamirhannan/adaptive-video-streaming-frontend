import * as React from "react";
import { cn } from "../../lib/utils.js";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  default:
    "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-[0_8px_20px_-8px_rgba(99,102,241,0.8)] hover:opacity-95",
  outline:
    "border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:border-white/30",
  ghost: "text-slate-300 hover:bg-white/8",
  danger:
    "border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
