"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { timeOffTypeSchema } from "@/lib/validation/time-off";
import { useToast } from "@/components/ui/Toast";

export default function TimeOffTypeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [type, setType] = useState<any>(null);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("time_off_types")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setType(data));
  }, [id]);

  async function save() {
    const parsed = timeOffTypeSchema.safeParse(type);
    if (!parsed.success) {
      push("Validation failed");
      return;
    }
    const { error } = await supabase
      .from("time_off_types")
      .update(parsed.data)
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Saved", "success");
  }

  if (!type) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div className="max-w-md rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <FormField label="Name">
        <input
          className="w-full rounded border px-3 py-2"
          value={type.name}
          onChange={(e) => setType({ ...type, name: e.target.value })}
        />
      </FormField>
      <FormField label="Unit">
        <select
          className="w-full rounded border px-3 py-2"
          value={type.unit}
          onChange={(e) => setType({ ...type, unit: e.target.value })}
        >
          <option value="days">Days</option>
          <option value="hours">Hours</option>
        </select>
      </FormField>
      <FormField label="Requires Allocation">
        <input
          type="checkbox"
          checked={type.requires_allocation}
          onChange={(e) =>
            setType({ ...type, requires_allocation: e.target.checked })
          }
        />
      </FormField>
      <FormField label="Requires Approval">
        <input
          type="checkbox"
          checked={type.requires_approval}
          onChange={(e) =>
            setType({ ...type, requires_approval: e.target.checked })
          }
        />
      </FormField>
      <Button onClick={save}>Save</Button>
    </div>
  );
}
