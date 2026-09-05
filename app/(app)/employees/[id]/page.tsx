"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import Link from "next/link";
import { employeeSchema } from "@/lib/validation/employee";
import { useToast } from "@/components/ui/Toast";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

  if (!employee) return <LoadingBlock label="Loading employee…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/employees" className="section-title link">
          ← Back to Employees
        </Link>
        <div className="actions">
          {!editing ? (
            <Button onClick={() => setEditing(true)}>Edit</Button>
          ) : (
            <Button onClick={save}>Save</Button>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card pad">
          <div className="person" style={{ marginBottom: 18 }}>
            <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
              {initials(employee.name)}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17 }}>
                {employee.name}
              </div>
              <div className="person-role">{employee.job_position ?? "--"}</div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <Badge status={employee.status} />
            </div>
          </div>

          <FormField label="Email">
            <input
              disabled={!editing}
              value={employee.email}
              onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
            />
          </FormField>
          <FormField label="Phone">
            <input
              disabled={!editing}
              value={employee.phone ?? ""}
              onChange={(e) => setEmployee({ ...employee, phone: e.target.value })}
            />
          </FormField>
          <FormField label="Job Position">
            <input
              disabled={!editing}
              value={employee.job_position ?? ""}
              onChange={(e) => setEmployee({ ...employee, job_position: e.target.value })}
            />
          </FormField>
          <div className="dl">
            <dt>Department</dt>
            <dd>{employee.departments?.name ?? "--"}</dd>
          </div>
        </div>

        <div className="card pad">
          <div className="section-title">Related records</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Button
              variant="secondary"
              className="justify-center"
              onClick={() => router.push(`/contracts?employee=${id}`)}
            >
              Contracts
            </Button>
            <Button
              variant="secondary"
              className="justify-center"
              onClick={() => router.push(`/attendance?employee=${id}`)}
            >
              Attendance
            </Button>
            <Button
              variant="secondary"
              className="justify-center"
              onClick={() => router.push(`/time-off/requests?employee=${id}`)}
            >
              Time Off
            </Button>
            <Button
              variant="secondary"
              className="justify-center"
              onClick={() => router.push(`/time-off/allocations?employee=${id}`)}
            >
              Allocations
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
