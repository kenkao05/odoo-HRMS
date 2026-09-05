"use client";
import { useEffect, useState } from "react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_payroll_user", label: "HR Payroll User" },
  { value: "hr_payroll_manager", label: "HR Payroll Manager" },
  { value: "admin", label: "Admin" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    email: string;
    roles: string[];
    employee_id: string;
  }>({
    email: "",
    roles: ["employee"],
    employee_id: "",
  });
  const [createdCreds, setCreatedCreds] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const { push } = useToast();
  const supabase = createClient();

  async function load() {
    const res = await fetch("/api/users");
    const body = await res.json();
    setUsers(body.users ?? []);
  }

  useEffect(() => {
    load();
    supabase
      .from("employees")
      .select("id, name")
      .then(({ data }) => setEmployees(data ?? []));
  }, []);

  function toggleRole(role: string) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role)
        ? f.roles.filter((r) => r !== role)
        : [...f.roles, role],
    }));
  }

  async function createUser() {
    if (!form.employee_id) {
      push("Please select an employee");
      return;
    }
    if (form.roles.length === 0) {
      push("Select at least one role");
      return;
    }
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const body = await res.json();
    if (!res.ok) {
      push(body.error ?? "Failed");
      return;
    }
    setOpen(false);
    setCreatedCreds({ email: form.email, password: body.temp_password });
    setForm({ email: "", roles: ["employee"], employee_id: "" });
    load();
  }

  async function deactivate(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: false }),
    });
    if (res.ok) {
      push("User deactivated", "success");
      load();
    }
  }

  async function resetPassword(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) push("Password reset link generated", "success");
  }

  return (
    <div>
      <div className="view-head">
        <div>
          <h2>User Management</h2>
          <p className="sub">
            Accounts, roles and permissions across the platform. Users are created here and linked to an employee record.
          </p>
        </div>
        <div className="actions">
          <Button onClick={() => setOpen(true)}>+ Add User</Button>
        </div>
      </div>

      {!users ? (
        <LoadingBlock label="Loading users…" />
      ) : (
        <div className="card">
          <Table
            columns={[
              { header: "Name", render: (u) => u.employees?.name ?? "--" },
              { header: "Email", render: (u) => u.employees?.email ?? "--" },
              { header: "Roles", render: (u) => (u.roles ?? [u.role]).join(", ") },
              {
                header: "Status",
                render: (u) => <Badge status={u.active ? "active" : "inactive"} />,
              },
              {
                header: "Actions",
                render: (u) => (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => resetPassword(u.id)}
                    >
                      Reset password
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deactivate(u.id)}
                    >
                      Deactivate
                    </button>
                  </div>
                ),
              },
            ]}
            rows={users}
          />
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add User">
        <FormField label="Email">
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label="Roles *">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ROLE_OPTIONS.map((r) => (
              <label key={r.value} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.roles.includes(r.value)}
                  onChange={() => toggleRole(r.value)}
                />
                {r.label}
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="Employee *">
          <select
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          >
            <option value="" disabled>
              Select employee
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </FormField>
        <Button onClick={createUser}>Create</Button>
      </Modal>

      <Modal
        open={!!createdCreds}
        onClose={() => setCreatedCreds(null)}
        title="User created"
      >
        <p className="sub" style={{ marginBottom: 12 }}>
          Share these credentials with the new user. This password will not be shown again --
          use &quot;Reset password&quot; on this page later if it&apos;s lost.
        </p>
        <FormField label="Email">
          <input readOnly value={createdCreds?.email ?? ""} />
        </FormField>
        <FormField label="Temporary password">
          <input readOnly value={createdCreds?.password ?? ""} />
        </FormField>
        <Button onClick={() => setCreatedCreds(null)}>Done</Button>
      </Modal>
    </div>
  );
}