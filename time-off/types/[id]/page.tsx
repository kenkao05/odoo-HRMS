"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
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

  if (!type) return <LoadingBlock label="Loading time off type…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/time-off/types" className="section-title link">
          ← Back to Time Off Types
        </Link>
      </div>
      <div className="card pad" style={{ maxWidth: 420 }}>
        <FormField label="Name">
          <input
            value={type.name}
            onChange={(e) => setType({ ...type, name: e.target.value })}
          />
        </FormField>
        <FormField label="Unit">
          <select
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
            style={{ width: "auto" }}
            checked={type.requires_allocation}
            onChange={(e) =>
              setType({ ...type, requires_allocation: e.target.checked })
            }
          />
        </FormField>
        <FormField label="Requires Approval">
          <input
            type="checkbox"
            style={{ width: "auto" }}
            checked={type.requires_approval}
            onChange={(e) =>
              setType({ ...type, requires_approval: e.target.checked })
            }
          />
        </FormField>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}
