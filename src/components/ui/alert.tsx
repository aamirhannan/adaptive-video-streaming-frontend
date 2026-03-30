import type { ReactNode } from "react";
import { cn } from "../../lib/utils.js";

export const Alert = ({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "success" | "info" | "warning";
}) => {
  const toneClass =
    tone === "success"
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
      : tone === "info"
        ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-100"
        : tone === "warning"
          ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
          : "border-rose-400/40 bg-rose-500/10 text-rose-100";

  return (
    <div className={cn("rounded-xl border px-3 py-2 text-sm", toneClass)}>
      {children}
    </div>
  );
};
