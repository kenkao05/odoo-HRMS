"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface EligibleEmployee {
  id: string;
  name: string;
  wage: number;
  start_date: string;
}

export function PayrunWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const [structures, setStructures] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [structureId, setStructureId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [eligible, setEligible] = useState<EligibleEmployee[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { push } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (open)
      supabase
        .from("salary_structures")
        .select("id, name")
        .eq("active", true)
        .then(({ data }) => setStructures(data ?? []));
  }, [open]);

  async function goToStep2() {
    if (!structureId || !periodStart || !periodEnd) {
      push("Fill in structure and period first");
      return;
    }
    const { data } = await supabase
      .from("contracts")
      .select("employee_id, wage, start_date, employees(name)")
      .eq("structure_id", structureId)
      .eq("status", "active");

    setEligible(
      (data ?? []).map((c: any) => ({
        id: c.employee_id,
        name: c.employees?.name,
        wage: c.wage,
        start_date: c.start_date,
      })),
    );
    setStep(2);
  }

  async function createPayrun() {
    if (selected.size === 0) {
      push("Select at least one employee");
      return;
    }
    const { data: payrun, error } = await supabase
      .from("payruns")
      .insert({
        structure_id: structureId,
        period_start: periodStart,
        period_end: periodEnd,
        status: "draft",
      })
      .select()
      .single();

    if (error || !payrun) {
      push(error?.message ?? "Failed to create payrun");
      return;
    }

    const { data: contracts } = await supabase
      .from("contracts")
      .select("id, employee_id")
      .eq("structure_id", structureId)
      .eq("status", "active")
      .in("employee_id", Array.from(selected));

    await supabase.from("payslips").insert(
      (contracts ?? []).map((c) => ({
        payrun_id: payrun.id,
        employee_id: c.employee_id,
        contract_id: c.id,
        status: "draft",
      })),
    );

    onClose();
    router.push(`/payroll/payruns/${payrun.id}`);
  }

  return (
    <Modal open={open} onClose={onClose} title="New Pay Run">
      <div className="wizard-steps">
        <div className={`wz-step ${step === 1 ? "current" : "done"}`}>
          <div className="wz-num">{step > 1 ? "✓" : 1}</div>
          <div className="wz-label">Scope &amp; period</div>
        </div>
        <div className="wz-line" />
        <div className={`wz-step ${step === 2 ? "current" : ""}`}>
          <div className="wz-num">2</div>
          <div className="wz-label">Select employees</div>
        </div>
      </div>

      {step === 1 && (
        <>
          <FormField label="Salary Structure">
            <select
              value={structureId}
              onChange={(e) => setStructureId(e.target.value)}
            >
              <option value="">Select...</option>
              {structures.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="field-row">
            <FormField label="Period Start">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </FormField>
            <FormField label="Period End">
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </FormField>
          </div>
          <div className="access-note">
            Only employees with an active contract on the selected structure will be eligible in the next step.
          </div>
          <Button onClick={goToStep2}>Continue</Button>
        </>
      )}
      {step === 2 && (
        <>
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginBottom: 12 }}>
            {selected.size} of {eligible.length} eligible employees selected.
          </p>
          <div className="select-grid" style={{ marginBottom: 16 }}>
            {eligible.map((e) => (
              <label
                key={e.id}
                className={`emp-check${selected.has(e.id) ? " checked" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(e.id)}
                  onChange={(ev) => {
                    const next = new Set(selected);
                    ev.target.checked ? next.add(e.id) : next.delete(e.id);
                    setSelected(next);
                  }}
                />
                <div>
                  <div className="person-name" style={{ fontSize: 13 }}>
                    {e.name}
                  </div>
                  <div className="person-role">
                    Wage {e.wage} · since {e.start_date}
                  </div>
                </div>
              </label>
            ))}
            {eligible.length === 0 && (
              <p className="empty">No employees with an active contract on this structure.</p>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={createPayrun}>Create Payrun</Button>
          </div>
        </>
      )}
    </Modal>
  );
}
