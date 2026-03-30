import { cn } from "../../lib/utils.js";

export const Badge = ({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "safe" | "warn" | "danger";
}) => {
  const toneClass =
    tone === "safe"
      ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
      : tone === "warn"
        ? "border-amber-400/40 bg-amber-500/10 text-amber-200"
        : tone === "danger"
          ? "border-rose-400/40 bg-rose-500/10 text-rose-200"
          : "border-white/20 bg-white/5 text-slate-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClass,
      )}
    >
      {label}
    </span>
  );
};
