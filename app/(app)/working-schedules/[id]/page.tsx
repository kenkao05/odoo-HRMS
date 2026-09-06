"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useToast } from "@/components/ui/Toast";
import { RequireRole } from "@/components/auth/RequireRole";
import { canManageHR } from "@/lib/utils/roles";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const cellInputStyle = {
  border: "1px solid var(--rule-strong)",
  borderRadius: "var(--radius-s)",
  padding: "7px 9px",
  background: "var(--paper-raised)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "var(--ink)",
  width: "100%",
} as const;

function hoursBetween(
  start: string | null,
  end: string | null,
  breakMin: number,
) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, (eh * 60 + em - (sh * 60 + sm) - breakMin) / 60);
}

function WorkingScheduleDetailPageInner() {
  const { id } = useParams<{ id: string }>();
  const [schedule, setSchedule] = useState<any>(null);
  const [days, setDays] = useState<any[]>([]);
  const { push } = useToast();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("working_schedules")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setSchedule(data));
    supabase
      .from("schedule_days")
      .select("*")
      .eq("schedule_id", id)
      .then(({ data }) => setDays(data ?? []));
  }, [id]);

  const totalHours = useMemo(
    () =>
      days.reduce(
        (sum, d) =>
          sum + hoursBetween(d.start_time, d.end_time, d.break_minutes),
        0,
      ),
    [days],
  );

  function updateDay(day: string, field: string, value: any) {
    setDays((prev) => {
      const exists = prev.find((d) => d.day === day);
      if (exists)
        return prev.map((d) => (d.day === day ? { ...d, [field]: value } : d));
      return [
        ...prev,
        {
          day,
          start_time: null,
          end_time: null,
          break_minutes: 0,
          [field]: value,
        },
      ];
    });
  }

  async function save() {
    await supabase.from("schedule_days").delete().eq("schedule_id", id);
    await supabase
      .from("schedule_days")
      .insert(days.map((d) => ({ ...d, schedule_id: id })));
    await supabase
      .from("working_schedules")
      .update({ weekly_hours: totalHours })
      .eq("id", id);
    push("Saved", "success");
  }

  if (!schedule) return <LoadingBlock label="Loading working schedule…" />;

  return (
    <div>
      <div className="view-head">
        <div>
          <Link href="/working-schedules" className="section-title link">
            ← Back to Working Schedules
          </Link>
          <h2 style={{ marginTop: 6 }}>{schedule.name}</h2>
          <p className="sub">{schedule.type ?? "--"}</p>
        </div>
      </div>

      <div className="card pad" style={{ maxWidth: 640 }}>
        <div className="section-title">Weekly pattern</div>
        <div className="table-wrap">
          <table className="ledger">
            <thead>
              <tr>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th className="num">Break (min)</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const d = days.find((x) => x.day === day) ?? {
                  start_time: "",
                  end_time: "",
                  break_minutes: 0,
                };
                return (
                  <tr key={day}>
                    <td>{DAY_LABELS[day]}</td>
                    <td>
                      <input
                        type="time"
                        style={cellInputStyle}
                        value={d.start_time ?? ""}
                        onChange={(e) =>
                          updateDay(day, "start_time", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        style={cellInputStyle}
                        value={d.end_time ?? ""}
                        onChange={(e) => updateDay(day, "end_time", e.target.value)}
                      />
                    </td>
                    <td className="num">
                      <input
                        type="number"
                        style={{ ...cellInputStyle, textAlign: "right" }}
                        value={d.break_minutes}
                        onChange={(e) =>
                          updateDay(day, "break_minutes", Number(e.target.value))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div
          className="card pad"
          style={{
            background: "var(--green-wash)",
            borderColor: "var(--green)",
            margin: "16px 0",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
            Auto-calculated total
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--green-deep)",
            }}
          >
            {totalHours.toFixed(1)}h / week
          </div>
        </div>

        <Button onClick={save}>Save schedule</Button>
      </div>
    </div>
  );
}

export default function WorkingScheduleDetailPage() {
  return (
    <RequireRole allow={canManageHR}>
      <WorkingScheduleDetailPageInner />
    </RequireRole>
  );
}