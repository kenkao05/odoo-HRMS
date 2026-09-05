"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

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

export default function WorkingScheduleDetailPage() {
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

  if (!schedule) return <p className="text-sm text-[#8a7a63]">Loading...</p>;

  return (
    <div className="max-w-2xl rounded-lg border border-[#e8e0cf] bg-[#FAF6EC] p-4">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-1">Day</th>
            <th className="text-left py-1">Start</th>
            <th className="text-left py-1">End</th>
            <th className="text-left py-1">Break (min)</th>
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
                <td className="py-1 capitalize">{day}</td>
                <td>
                  <input
                    type="time"
                    className="rounded border px-2 py-1"
                    value={d.start_time ?? ""}
                    onChange={(e) =>
                      updateDay(day, "start_time", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="rounded border px-2 py-1"
                    value={d.end_time ?? ""}
                    onChange={(e) => updateDay(day, "end_time", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="w-20 rounded border px-2 py-1"
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
      <p className="mt-4 font-medium text-[#3E2723]">
        Total Weekly Hours: {totalHours.toFixed(1)}
      </p>
      <Button className="mt-4" onClick={save}>
        Save
      </Button>
    </div>
  );
}
