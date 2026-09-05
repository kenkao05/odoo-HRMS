"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useToast } from "@/components/ui/Toast";
import { salaryRuleSchema } from "@/lib/validation/salary";

export default function SalaryRuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [rule, setRule] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("salary_rules")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setRule(data));
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
    const parsed = salaryRuleSchema.safeParse({
      structure_id: rule.structure_id,
      name: rule.name,
      code: rule.code,
      category: rule.category,
      sequence: Number(rule.sequence),
      computation_type: rule.computation_type,
      fixed_amount:
        rule.fixed_amount === "" || rule.fixed_amount === null
          ? null
          : Number(rule.fixed_amount),
      percentage:
        rule.percentage === "" || rule.percentage === null
          ? null
          : Number(rule.percentage),
      percentage_of_code: rule.percentage_of_code || null,
      formula_expression: rule.formula_expression || null,
    });
    if (!parsed.success) {
      push(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    const { error } = await supabase
      .from("salary_rules")
      .update(parsed.data)
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Saved", "success");
  }

  if (!rule) return <LoadingBlock label="Loading salary rule…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/payroll/rules" className="section-title link">
          ← Back to Salary Rules
        </Link>
      </div>
      <div className="card pad" style={{ maxWidth: 480 }}>
        <FormField label="Name">
          <input
            disabled={!canEdit}
            value={rule.name}
            onChange={(e) => setRule({ ...rule, name: e.target.value })}
          />
        </FormField>
        <FormField label="Code">
          <input
            disabled={!canEdit}
            value={rule.code}
            onChange={(e) => setRule({ ...rule, code: e.target.value })}
          />
        </FormField>
        <div className="field-row">
          <FormField label="Category">
            <select
              disabled={!canEdit}
              value={rule.category}
              onChange={(e) => setRule({ ...rule, category: e.target.value })}
            >
              <option value="basic">Basic</option>
              <option value="allowance">Allowance</option>
              <option value="deduction">Deduction</option>
              <option value="gross">Gross</option>
              <option value="net">Net</option>
            </select>
          </FormField>
          <FormField label="Sequence">
            <input
              type="number"
              disabled={!canEdit}
              value={rule.sequence}
              onChange={(e) => setRule({ ...rule, sequence: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="Computation Type">
          <select
            disabled={!canEdit}
            value={rule.computation_type}
            onChange={(e) =>
              setRule({ ...rule, computation_type: e.target.value })
            }
          >
            <option value="fixed">Fixed Amount</option>
            <option value="percentage">Percentage of another rule</option>
            <option value="formula">Simple Formula</option>
          </select>
        </FormField>

        {rule.computation_type === "fixed" && (
          <FormField label="Fixed Amount">
            <input
              type="number"
              disabled={!canEdit}
              value={rule.fixed_amount ?? ""}
              onChange={(e) => setRule({ ...rule, fixed_amount: e.target.value })}
            />
          </FormField>
        )}
        {rule.computation_type === "percentage" && (
          <div className="field-row">
            <FormField label="Percentage">
              <input
                type="number"
                disabled={!canEdit}
                value={rule.percentage ?? ""}
                onChange={(e) => setRule({ ...rule, percentage: e.target.value })}
              />
            </FormField>
            <FormField label="Percentage Of (rule code)">
              <input
                disabled={!canEdit}
                value={rule.percentage_of_code ?? ""}
                onChange={(e) =>
                  setRule({ ...rule, percentage_of_code: e.target.value })
                }
              />
            </FormField>
          </div>
        )}
        {rule.computation_type === "formula" && (
          <FormField label="Formula (e.g. basic * 0.12)">
            <input
              disabled={!canEdit}
              value={rule.formula_expression ?? ""}
              onChange={(e) =>
                setRule({ ...rule, formula_expression: e.target.value })
              }
            />
          </FormField>
        )}

        {canEdit && <Button onClick={save}>Save</Button>}
      </div>
    </div>
  );
}
