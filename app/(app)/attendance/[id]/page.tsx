"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { attendanceCorrectionSchema } from "@/lib/validation/attendance";
import { useToast } from "@/components/ui/Toast";

export default function AttendanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<any>(null);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("attendance")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setRow(data));
  }, [id]);

  async function save() {
    const parsed = attendanceCorrectionSchema.safeParse({
      check_in: row.check_in,
      check_out: row.check_out,
      status: row.status,
    });
    if (!parsed.success) {
      push(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }
    const { error } = await supabase
      .from("attendance")
      .update({ ...parsed.data, corrected: true })
      .eq("id", id);
    if (error) {
      push(error.message);
      return;
    }
    push("Saved", "success");
  }

  if (!row) return <LoadingBlock label="Loading attendance record…" />;

  return (
    <div>
      <div className="view-head">
        <Link href="/attendance" className="section-title link">
          ← Back to Attendance
        </Link>
      </div>
      <div className="card pad" style={{ maxWidth: 420 }}>
        <FormField label="Check In">
          <input
            type="datetime-local"
            value={row.check_in?.slice(0, 16)}
            onChange={(e) =>
              setRow({ ...row, check_in: new Date(e.target.value).toISOString() })
            }
          />
        </FormField>
        <FormField label="Check Out">
          <input
            type="datetime-local"
            value={row.check_out?.slice(0, 16) ?? ""}
            onChange={(e) =>
              setRow({
                ...row,
                check_out: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
          />
        </FormField>
        <FormField label="Status">
          <select
            value={row.status}
            onChange={(e) => setRow({ ...row, status: e.target.value })}
          >
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="missing_checkout">Missing Checkout</option>
          </select>
        </FormField>
        <Button onClick={save}>Save (manual correction)</Button>
      </div>
    </div>
  );
}