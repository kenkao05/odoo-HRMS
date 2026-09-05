"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { employeeSchema } from "@/lib/validation/employee";
import { useToast } from "@/components/ui/Toast";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("employees")
      .select("*, departments(name)")
      .eq("id", id)
      .single()
      .then(({ data }) => setEmployee(data));
  }, [id]);

  async function save() {
    const parsed = employeeSchema.safeParse(employee);
    if (!parsed.success) {
      push("Validation failed");
      return;
    }
    const { error } = await supabase
      .from("employees")
      .update(parsed.data)
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Saved", "success");
    setEditing(false);
  }

  if (!employee) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-[#3E2723]">
          {employee.name}
        </h1>
        <Badge status={employee.status} />
      </div>
      <div className="mb-6 flex gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push(`/contracts?employee=${id}`)}
        >
          Contracts
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push(`/attendance?employee=${id}`)}
        >
          Attendance
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push(`/time-off/requests?employee=${id}`)}
        >
          Time Off
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push(`/time-off/allocations?employee=${id}`)}
        >
          Allocations
        </Button>
      </div>
      <div className="max-w-md rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
        <FormField label="Email">
          <input
            disabled={!editing}
            className="w-full rounded border px-3 py-2"
            value={employee.email}
            onChange={(e) =>
              setEmployee({ ...employee, email: e.target.value })
            }
          />
        </FormField>
        <FormField label="Phone">
          <input
            disabled={!editing}
            className="w-full rounded border px-3 py-2"
            value={employee.phone ?? ""}
            onChange={(e) =>
              setEmployee({ ...employee, phone: e.target.value })
            }
          />
        </FormField>
        <FormField label="Job Position">
          <input
            disabled={!editing}
            className="w-full rounded border px-3 py-2"
            value={employee.job_position ?? ""}
            onChange={(e) =>
              setEmployee({ ...employee, job_position: e.target.value })
            }
          />
        </FormField>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Edit</Button>
        ) : (
          <Button onClick={save}>Save</Button>
        )}
      </div>
    </div>
  );
}
