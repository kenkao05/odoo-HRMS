"use client";
export function FilterBar({
  departments,
  filters,
  onChange,
}: {
  departments: { id: string; name: string }[];
  filters: {
    period?: string;
    department_id?: string;
    employee_type?: string;
  };
  onChange: (filters: {
    period?: string;
    department_id?: string;
    employee_type?: string;
  }) => void;
}) {
  const selectStyle = {
    padding: "8px 12px",
    border: "1px solid var(--rule-strong)",
    borderRadius: "var(--radius-s)",
    background: "var(--paper-raised)",
    fontSize: 13,
  };

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <select
        value={filters.period ?? ""}
        onChange={(e) => onChange({ period: e.target.value || undefined })}
        style={selectStyle}
      >
        <option value="">All Time</option>
        <option value="this_month">This Month</option>
        <option value="last_month">Last Month</option>
        <option value="this_quarter">This Quarter</option>
        <option value="this_year">This Year</option>
      </select>
      <select
        value={filters.department_id ?? ""}
        onChange={(e) =>
          onChange({ department_id: e.target.value || undefined })
        }
        style={selectStyle}
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        value={filters.employee_type ?? ""}
        onChange={(e) =>
          onChange({ employee_type: e.target.value || undefined })
        }
        style={selectStyle}
      >
        <option value="">All Employee Types</option>
        <option value="full_time">Full Time</option>
        <option value="part_time">Part Time</option>
        <option value="contract">Contract</option>
      </select>
    </div>
  );
}