"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Table } from "@/components/ui/Table";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useToast } from "@/components/ui/Toast";
import { salaryStructureSchema } from "@/lib/validation/salary";
import { RequireRole } from "@/components/auth/RequireRole";
import { canAccessPayroll } from "@/lib/utils/roles";

function SalaryStructureDetailPageInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [structure, setStructure] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const { push } = useToast();
  const supabase = createClient();

  async function loadRules() {
    const { data } = await supabase
      .from("salary_rules")
      .select("*")
      .eq("structure_id", id)
      .order("sequence");
    setRules(data ?? []);
  }

  useEffect(() => {
    supabase
      .from("salary_structures")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setStructure(data));
    loadRules();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setCanEdit(
        profile?.role === "admin" ||
          profile?.role === "hr_payroll_manager",
      );
    })();
  }, [id]);

  async function save() {
    const parsed = salaryStructureSchema.safeParse({
      name: structure.name,
      active: structure.active,
    });
    if (!parsed.success) {
      push(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    const { error } = await supabase
      .from("salary_structures")
      .update(parsed.data)
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Saved", "success");
  }

  async function addRule() {
    const { data: newRule, error } = await supabase
      .from("salary_rules")
      .insert({
        structure_id: id,
        name: "New Rule",
        code: `RULE_${Date.now()}`,
        category: "allowance",
        sequence: rules.length + 1,
        computation_type: "fixed",
        fixed_amount: 0,
      })
      .select()
      .single();
    if (error || !newRule) {
      push(error?.message ?? "Failed to add rule");
      return;
    }
    router.push(`/payroll/rules/${newRule.id}`);
  }

  if (!structure) return <LoadingBlock label="Loading salary structure…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/payroll/structures" className="section-title link">
          ← Back to Salary Structures
        </Link>
      </div>

      <div className="card pad" style={{ maxWidth: 480, marginBottom: 22 }}>
        <FormField label="Name">
          <input
            disabled={!canEdit}
            value={structure.name}
            onChange={(e) =>
              setStructure({ ...structure, name: e.target.value })
            }
          />
        </FormField>
        <FormField label="Active">
          <label className="switch">
            <input
              type="checkbox"
              disabled={!canEdit}
              checked={structure.active}
              onChange={(e) =>
                setStructure({ ...structure, active: e.target.checked })
              }
            />
            <span className="slider" />
          </label>
        </FormField>
        {canEdit && <Button onClick={save}>Save</Button>}
      </div>

      <div className="section-title">
        Salary Rules (by sequence)
        {canEdit && (
          <button className="link" onClick={addRule}>
            + Add Rule
          </button>
        )}
      </div>
      <div className="card">
        <Table
          columns={[
            { header: "Seq", render: (r) => r.sequence, num: true },
            { header: "Name", render: (r) => r.name },
            { header: "Code", render: (r) => r.code },
            { header: "Category", render: (r) => r.category },
          ]}
          rows={rules}
          onRowClick={(r) => router.push(`/payroll/rules/${r.id}`)}
        />
      </div>
    </div>
  );
}

export default function SalaryStructureDetailPage() {
  return (
    <RequireRole allow={canAccessPayroll}>
      <SalaryStructureDetailPageInner />
    </RequireRole>
  );
}