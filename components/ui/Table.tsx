import { ReactNode, CSSProperties } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  num?: boolean;
}

export function Table<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
  rowStyle,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  rowStyle?: (row: T) => CSSProperties | undefined;
}) {
  return (
    <div className="table-wrap">
      <table className="ledger">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header} className={c.num ? "num" : ""}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              style={{
                ...(onRowClick ? { cursor: "pointer" } : {}),
                ...(rowStyle?.(row) ?? {}),
              }}
            >
              {columns.map((c) => (
                <td key={c.header} className={c.num ? "num" : ""}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty">
                No records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
