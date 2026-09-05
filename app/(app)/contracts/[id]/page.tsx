"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { contractSchema } from "@/lib/validation/contract";
import { useToast } from "@/components/ui/Toast";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);
  const [structures, setStructures] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>(
    [],
  );
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("contracts")
      .select("*, employees(name)")
      .eq("id", id)
      .single()
      .then(({ data }) => setContract(data));
    supabase
      .from("salary_structures")
      .select("id, name")
      .then(({ data }) => setStructures(data ?? []));
    supabase
      .from("departments")
      .select("id, name")
      .then(({ data }) => setDepartments(data ?? []));
  }, [id]);

  async function save() {
    const parsed = contractSchema.safeParse({
      employee_id: contract.employee_id,
      department_id: contract.department_id,
      job_position: contract.job_position,
      start_date: contract.start_date,
      end_date: contract.end_date,
      wage: Number(contract.wage),
      structure_id: contract.structure_id,
      status: contract.status,
    });
    if (!parsed.success) {
      push(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    const { error } = await supabase
      .from("contracts")
      .update(parsed.data)
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    } // surfaces the DB overlap-trigger error too
    push("Saved", "success");
  }

  if (!contract) return <LoadingBlock label="Loading contract…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/contracts" className="section-title link">
          ← Back to Contracts
        </Link>
      </div>
      <div className="card pad" style={{ maxWidth: 480 }}>
        <FormField label="Employee">
          <input value={contract.employees?.name ?? "--"} disabled />
        </FormField>
        <FormField label="Department">
          <select
            value={contract.department_id ?? ""}
            onChange={(e) =>
              setContract({ ...contract, department_id: e.target.value || null })
            }
          >
            <option value="">--</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Job Position">
          <input
            value={contract.job_position ?? ""}
            onChange={(e) => setContract({ ...contract, job_position: e.target.value })}
          />
        </FormField>
        <FormField label="Start Date">
          <input
            type="date"
            value={contract.start_date}
            onChange={(e) => setContract({ ...contract, start_date: e.target.value })}
          />
        </FormField>
        <FormField label="End Date">
          <input
            type="date"
            value={contract.end_date ?? ""}
            onChange={(e) =>
              setContract({ ...contract, end_date: e.target.value || null })
            }
          />
        </FormField>
        <FormField label="Wage">
          <input
            type="number"
            value={contract.wage}
            onChange={(e) => setContract({ ...contract, wage: e.target.value })}
          />
        </FormField>
        <FormField label="Salary Structure">
          <select
            value={contract.structure_id ?? ""}
            onChange={(e) => setContract({ ...contract, structure_id: e.target.value })}
          >
            {structures.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Status">
          <select
            value={contract.status}
            onChange={(e) => setContract({ ...contract, status: e.target.value })}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </FormField>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}