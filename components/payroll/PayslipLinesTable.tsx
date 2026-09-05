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
    <div className="rounded-lg border border-[#e8e0cf] bg-[#FAF6EC]">
      <table className="w-full text-sm">
        <thead className="bg-[#3E2723] text-[#F5EFE0]">
          <tr>
            <th className="px-4 py-2 text-left">Rule</th>
            <th className="px-4 py-2 text-left">Category</th>
            <th className="px-4 py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l) => (
            <tr key={l.id} className="border-t border-[#e8e0cf]">
              <td className="px-4 py-2">{l.name}</td>
              <td className="px-4 py-2 capitalize">{l.category}</td>
              <td className="px-4 py-2 text-right">{l.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[#3E2723] font-semibold">
            <td className="px-4 py-2" colSpan={2}>
              Gross
            </td>
            <td className="px-4 py-2 text-right">{gross.toFixed(2)}</td>
          </tr>
          <tr className="font-semibold">
            <td className="px-4 py-2" colSpan={2}>
              Net
            </td>
            <td className="px-4 py-2 text-right">{net.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
