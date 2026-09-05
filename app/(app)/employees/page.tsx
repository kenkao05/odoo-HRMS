"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { ListFilters } from "@/components/ui/ListFilters";
import { employeeSchema, EmployeeInput } from "@/lib/validation/employee";

const EMPTY_FORM: EmployeeInput = {
  name: "",
  email: "",
  phone: "",
  department_id: null,
  manager_id: null,
  job_position: "",
  schedule_id: null,
  employee_type: "full_time",
  bank_details: "",
  status: "active",
};

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
  const [schedules, setSchedules] = useState<{ id: string; name: string }[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [department, setDepartment] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EmployeeInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const supabase = createClient();
  const { push } = useToast();

  function loadEmployees() {
    supabase
      .from("employees")
      .select("*, departments(name)")
      .then(({ data }) => setEmployees(data ?? []));
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    supabase.from("departments").select("id,name").then(({ data }) => setDepartments(data ?? []));
    supabase
      .from("working_schedules")
      .select("id,name")
      .then(({ data }) => setSchedules(data ?? []));
  }, []);

  async function createEmployee() {
    const parsed = employeeSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    const { error } = await supabase.from("employees").insert(parsed.data);
    if (error) {
      push(error.message);
      return;
    }
    push("Employee created", "success");
    setOpen(false);
    setForm(EMPTY_FORM);
    loadEmployees();
  }

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
        <div className="actions">
          <Button onClick={() => setOpen(true)}>+ New Employee</Button>
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

      <Modal open={open} onClose={() => setOpen(false)} title="New Employee">
        <FormField label="Name *" error={errors.name?.[0]}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Email *" error={errors.email?.[0]}>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label="Phone" error={errors.phone?.[0]}>
          <input
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </FormField>
        <FormField label="Department">
          <select
            value={form.department_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, department_id: e.target.value || null })
            }
          >
            <option value="">No department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Manager">
          <select
            value={form.manager_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, manager_id: e.target.value || null })
            }
          >
            <option value="">No manager</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Job Position" error={errors.job_position?.[0]}>
          <input
            value={form.job_position ?? ""}
            onChange={(e) => setForm({ ...form, job_position: e.target.value })}
          />
        </FormField>
        <FormField label="Working Schedule">
          <select
            value={form.schedule_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, schedule_id: e.target.value || null })
            }
          >
            <option value="">No schedule</option>
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Employee Type *">
          <select
            value={form.employee_type}
            onChange={(e) =>
              setForm({
                ...form,
                employee_type: e.target.value as EmployeeInput["employee_type"],
              })
            }
          >
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </FormField>
        <FormField label="Status *">
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as EmployeeInput["status"] })
            }
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>
        <FormField label="Bank Details" error={errors.bank_details?.[0]}>
          <input
            value={form.bank_details ?? ""}
            onChange={(e) => setForm({ ...form, bank_details: e.target.value })}
          />
        </FormField>
        <Button onClick={createEmployee}>Create</Button>
      </Modal>
    </div>
  );
}