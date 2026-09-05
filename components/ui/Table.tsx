import { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export function Table<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <table className="w-full overflow-hidden rounded-lg border border-[#e8e0cf]">
      <thead className="bg-[#3E2723] text-[#F5EFE0]">
        <tr>
          {columns.map((c) => (
            <th
              key={c.header}
              className="px-4 py-2 text-left text-sm font-medium"
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-[#FAF6EC]">
        {rows.map((row) => (
          <tr
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={onRowClick ? "cursor-pointer hover:bg-[#efe6d1]" : ""}
          >
            {columns.map((c) => (
              <td
                key={c.header}
                className="px-4 py-2 text-sm text-[#3E2723] border-t border-[#e8e0cf]"
              >
                {c.render(row)}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-6 text-center text-sm text-[#8a7a63]"
            >
              No records
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
