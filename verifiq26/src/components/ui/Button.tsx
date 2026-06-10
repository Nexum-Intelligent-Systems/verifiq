import Link from "next/link";

type SheetTagProps = {
  code: string;
  label: string;
  href?: string;
};

/** Primary CTA — drawing sheet-reference styling (code chip + label + leader arrow). */
export function SheetTagButton({ code, label, href = "#" }: SheetTagProps) {
  return (
    <Link href={href} className="btn-sheet-tag">
      <span className="sheet-code">{code}</span>
      <span className="sheet-label">
        {label}
        <span className="sheet-arrow" aria-hidden />
      </span>
    </Link>
  );
}

type LeaderProps = {
  num: string;
  label: string;
  href?: string;
};

/** Secondary action — numbered callout with a leader line. */
export function LeaderButton({ num, label, href = "#" }: LeaderProps) {
  return (
    <Link href={href} className="btn-leader">
      <span className="leader-num">{num}</span>
      <span className="leader-line" aria-hidden />
      <span className="leader-label">{label}</span>
    </Link>
  );
}
