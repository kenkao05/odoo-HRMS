"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { salaryStructureSchema } from "@/lib/validation/salary";

export default function SalaryStructureDetailPage() {
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
        .select("role, can_edit_salary_config")
        .eq("id", user.id)
        .single();
      setCanEdit(
        profile?.role === "admin" ||
          (profile?.role === "hr_payroll" && !!profile?.can_edit_salary_config),
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

  if (!structure) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div>
      <div className="mb-4 max-w-md rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
        <FormField label="Name">
          <input
            disabled={!canEdit}
            className="w-full rounded border px-3 py-2"
            value={structure.name}
            onChange={(e) =>
              setStructure({ ...structure, name: e.target.value })
            }
          />
        </FormField>
        <FormField label="Active">
          <input
            type="checkbox"
            disabled={!canEdit}
            checked={structure.active}
            onChange={(e) =>
              setStructure({ ...structure, active: e.target.checked })
            }
          />
        </FormField>
        {canEdit && <Button onClick={save}>Save</Button>}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#3E2723]">
          Salary Rules (by sequence)
        </h2>
        {canEdit && (
          <Button variant="secondary" onClick={addRule}>
            Add Rule
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e8e0cf]">
        <table className="w-full text-sm">
          <thead className="bg-[#3E2723] text-[#F5EFE0]">
            <tr>
              <th className="px-4 py-2 text-left">Seq</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Code</th>
              <th className="px-4 py-2 text-left">Category</th>
            </tr>
          </thead>
          <tbody className="bg-[#FAF6EC]">
            {rules.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-t border-[#e8e0cf] hover:bg-[#efe6d1]"
                onClick={() => router.push(`/payroll/rules/${r.id}`)}
              >
                <td className="px-4 py-2">{r.sequence}</td>
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">{r.code}</td>
                <td className="px-4 py-2 capitalize">{r.category}</td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#8a7a63]">
                  No rules yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
