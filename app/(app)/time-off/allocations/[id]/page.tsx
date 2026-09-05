"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { allocationSchema } from "@/lib/validation/time-off";
import { useToast } from "@/components/ui/Toast";

export default function AllocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [alloc, setAlloc] = useState<any>(null);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("allocations")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setAlloc(data));
  }, [id]);

  async function approve() {
    const { error } = await supabase
      .from("allocations")
      .update({ status: "approved" })
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Approved", "success");
    setAlloc({ ...alloc, status: "approved" });
  }

  async function save() {
    const parsed = allocationSchema.safeParse({
      employee_id: alloc.employee_id,
      type_id: alloc.type_id,
      allocated: Number(alloc.allocated),
      valid_from: alloc.valid_from,
      valid_to: alloc.valid_to,
      status: alloc.status,
    });
    if (!parsed.success) {
      push("Validation failed");
      return;
    }
    const { error } = await supabase
      .from("allocations")
      .update({
        allocated: parsed.data.allocated,
        valid_from: parsed.data.valid_from,
        valid_to: parsed.data.valid_to,
      })
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Saved", "success");
  }

  if (!alloc) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div className="max-w-md rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <FormField label="Allocated">
        <input
          type="number"
          className="w-full rounded border px-3 py-2"
          value={alloc.allocated}
          onChange={(e) => setAlloc({ ...alloc, allocated: e.target.value })}
        />
      </FormField>
      <FormField label="Valid From">
        <input
          type="date"
          className="w-full rounded border px-3 py-2"
          value={alloc.valid_from}
          onChange={(e) => setAlloc({ ...alloc, valid_from: e.target.value })}
        />
      </FormField>
      <FormField label="Valid To">
        <input
          type="date"
          className="w-full rounded border px-3 py-2"
          value={alloc.valid_to ?? ""}
          onChange={(e) =>
            setAlloc({ ...alloc, valid_to: e.target.value || null })
          }
        />
      </FormField>
      <div className="flex gap-2">
        <Button onClick={save}>Save</Button>
        {alloc.status === "pending" && (
          <Button variant="secondary" onClick={approve}>
            Approve
          </Button>
        )}
      </div>
    </div>
  );
}
