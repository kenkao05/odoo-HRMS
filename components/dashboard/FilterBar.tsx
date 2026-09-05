"use client";
export function FilterBar({
  departments,
  onChange,
}: {
  departments: { id: string; name: string }[];
  onChange: (filters: {
    department_id?: string;
    employee_type?: string;
  }) => void;
}) {
  return (
    <div className="mb-4 flex gap-3">
      <select
        className="rounded border px-3 py-2 text-sm"
        onChange={(e) =>
          onChange({ department_id: e.target.value || undefined })
        }
      >
        <option value="">All Departments</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <select
        className="rounded border px-3 py-2 text-sm"
        onChange={(e) =>
          onChange({ employee_type: e.target.value || undefined })
        }
      >
        <option value="">All Employee Types</option>
        <option value="full_time">Full Time</option>
        <option value="part_time">Part Time</option>
        <option value="contract">Contract</option>
      </select>
    </div>
  );
}
