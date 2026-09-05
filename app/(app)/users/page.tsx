"use client";
import { useEffect, useState } from "react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "employee",
    employee_id: "",
    can_edit_salary_config: false,
  });
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

  async function createUser() {
    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const body = await res.json();
    if (!res.ok) {
      push(body.error ?? "Failed");
      return;
    }
    push("User created", "success");
    setOpen(false);
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
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>Add User</Button>
      </div>
      <Table
        columns={[
          { header: "Name", render: (u) => u.employees?.name ?? "--" },
          { header: "Email", render: (u) => u.employees?.email ?? "--" },
          { header: "Role", render: (u) => u.role },
          {
            header: "Status",
            render: (u) => <Badge status={u.active ? "active" : "inactive"} />,
          },
          {
            header: "Actions",
            render: (u) => (
              <div className="flex gap-2">
                <button
                  className="text-xs text-[#6B4226] underline"
                  onClick={() => resetPassword(u.id)}
                >
                  Reset password
                </button>
                <button
                  className="text-xs text-[#C62828] underline"
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
      <Modal open={open} onClose={() => setOpen(false)} title="Add User">
        <FormField label="Name">
          <input
            className="w-full rounded border px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Email">
          <input
            className="w-full rounded border px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label="Role">
          <select
            className="w-full rounded border px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="hr_payroll">HR Payroll</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        <FormField label="Linked Employee">
          <select
            className="w-full rounded border px-3 py-2"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          >
            <option value="">None</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </FormField>
        {form.role === "hr_payroll" && (
          <FormField label="Can edit salary config">
            <input
              type="checkbox"
              checked={form.can_edit_salary_config}
              onChange={(e) =>
                setForm({ ...form, can_edit_salary_config: e.target.checked })
              }
            />
          </FormField>
        )}
        <Button onClick={createUser}>Create</Button>
      </Modal>
    </div>
  );
}
