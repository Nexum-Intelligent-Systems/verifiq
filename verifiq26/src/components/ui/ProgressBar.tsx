type ProgressBarProps = {
  value: number;
  label?: string;
  hint?: string;
  showPercent?: boolean;
  indeterminate?: boolean;
  size?: "sm" | "md" | "lg";
};

export function ProgressBar({
  value,
  label,
  hint,
  showPercent = true,
  indeterminate = false,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const height = size === "sm" ? "h-1" : size === "lg" ? "h-2.5" : "h-1.5";

  return (
    <div>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted)]">
              {label}
            </span>
          )}
          {showPercent && !indeterminate && (
            <span className="font-mono text-[10px] tabular-nums text-[var(--gold-light)]">
              {clamped}%
            </span>
          )}
          {indeterminate && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--gold-light)]">
              …
            </span>
          )}
        </div>
      )}
      <div className={`${height} w-full overflow-hidden bg-[var(--border)]`}>
        <div
          className={`h-full bg-[var(--gold)] transition-all duration-500 ${
            indeterminate ? "w-1/3 animate-pulse" : ""
          }`}
          style={indeterminate ? undefined : { width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
      {hint && <p className="mt-1.5 text-xs text-[var(--muted)]">{hint}</p>}
    </div>
  );
}
