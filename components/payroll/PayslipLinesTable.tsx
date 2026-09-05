import type { PayslipLine } from "@/lib/types/database.types";

export function PayslipLinesTable({
  lines,
  gross,
  net,
}: {
  lines: PayslipLine[];
  gross: number;
  net: number;
}) {
  return (
    <div className="payslip-doc">
      <div className="payslip-rows">
        {lines.map((l) => (
          <div className="ps-row" key={l.id}>
            <span>
              {l.name} <span className="label-sub">{l.category}</span>
            </span>
            <span
              className="num"
              style={l.category === "deduction" ? { color: "var(--brick)" } : undefined}
            >
              {l.category === "deduction" ? "−" : ""}
              {l.amount.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="ps-row total">
          <span>Gross</span>
          <span className="num">{gross.toFixed(2)}</span>
        </div>
        <div className="ps-row total">
          <span>Net</span>
          <span className="num">{net.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}