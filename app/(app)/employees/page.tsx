"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";
import { ListFilters } from "@/components/ui/ListFilters";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("employees")
      .select("*, departments(name)")
      .then(({ data }) => setEmployees(data ?? []));
  }, []);

  useEffect(() => {
    supabase.from("departments").select("id,name").then(({ data }) => setDepartments(data ?? []));
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      (!type || e.employee_type === type) &&
      (!status || e.status === status) &&
      (!department || e.department_id === department),
  );

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>Employee master</h2>
          <p className="sub">
            Profiles, departments and status. Click a row to open the full record.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <ListFilters
          departments={departments}
          type={type}
          status={status}
          department={department}
          onType={setType}
          onStatus={setStatus}
          onDepartment={setDepartment}
        />
        <div className="view-toggle" role="group" aria-label="Employee view">
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
            ☷ List
          </button>
          <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}>
            ▦ Kanban
          </button>
        </div>
      </div>
      {view === "list" ? (
        <div className="card">
          <Table
            columns={[
              {
                header: "Employee",
                render: (e) => (
                  <div className="person">
                    <div className="avatar">{initials(e.name)}</div>
                    <div>
                      <div className="person-name">{e.name}</div>
                      <div className="person-role">{e.job_position ?? "--"}</div>
                    </div>
                  </div>
                ),
              },
              { header: "Department", render: (e) => e.departments?.name ?? "--" },
              {
                header: "Employee Type",
                render: (e) =>
                  e.employee_type === "full_time"
                    ? "Full Time"
                    : e.employee_type === "part_time"
                      ? "Part Time"
                      : e.employee_type === "contract"
                        ? "Contract"
                        : (e.employee_type ?? "--"),
              },
              { header: "Status", render: (e) => <Badge status={e.status} /> },
            ]}
            rows={filteredEmployees}
            onRowClick={(e) => router.push(`/employees/${e.id}`)}
          />
        </div>
      ) : (
        <div className="employee-kanban">
          {(
            [
              ["full_time", "Full Time"],
              ["part_time", "Part Time"],
              ["contract", "Contract"],
            ] as const
          ).map(([key, label]) => {
            const column = employees.filter(
              (e) =>
                e.employee_type === key &&
                (!status || e.status === status) &&
                (!department || e.department_id === department),
            );
            return (
              <div className="kanban-column" key={key}>
                <div className="kanban-head">
                  <strong>{label}</strong>
                  <span>{column.length}</span>
                </div>
                <div className="kanban-cards">
                  {column.map((e) => (
                    <button
                      key={e.id}
                      className="employee-kanban-card"
                      onClick={() => router.push(`/employees/${e.id}`)}
                    >
                      <div className="person">
                        <div className="avatar">{initials(e.name)}</div>
                        <div>
                          <div className="person-name">{e.name}</div>
                          <div className="person-role">{e.job_position ?? "--"}</div>
                        </div>
                      </div>
                      <div className="kanban-meta">
                        <span>{e.departments?.name ?? "No department"}</span>
                        <Badge status={e.status} />
                      </div>
                    </button>
                  ))}
                  {column.length === 0 && <div className="kanban-empty">No employees</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
