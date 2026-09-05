"use client";

export type FilterStatusOption = { value: string; label: string };

export function ListFilters({
  departments = [],
  type,
  status,
  department,
  onType,
  onStatus,
  onDepartment,
  statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
  showType = true,
  showStatus = true,
}: {
  departments?: any[];
  type: string;
  status: string;
  department?: string;
  onType: (v: string) => void;
  onStatus: (v: string) => void;
  onDepartment: (v: string) => void;
  statusOptions?: FilterStatusOption[];
  showType?: boolean;
  showStatus?: boolean;
}) {
  const style = { padding: "8px 12px", border: "1px solid var(--rule-strong)", borderRadius: "var(--radius-s)", background: "var(--paper-raised)", fontSize: 13 };
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {departments.length > 0 && (
        <select aria-label="Department" style={style} value={department ?? ""} onChange={e => onDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      )}
      {showType && (
        <select aria-label="Employee type" style={style} value={type} onChange={e => onType(e.target.value)}>
          <option value="">All Employee Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
        </select>
      )}
      {showStatus && (
        <select aria-label="Status" style={style} value={status} onChange={e => onStatus(e.target.value)}>
          <option value="">All Status</option>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
}
