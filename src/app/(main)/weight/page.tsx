import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { addWeightLog, deleteWeightLog } from "@/app/actions/weight";
import { getWeightTrend } from "@/lib/weightTrend";
import { inputClass, labelClass, primaryButtonClass, cardClass, dangerLinkClass } from "@/lib/ui";

function str(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function WeightPage(props: PageProps<"/weight">) {
  const searchParams = await props.searchParams;
  const error = str(searchParams.error) || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();

  const [{ data: logs }, { data: profile }] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("id, recorded_on, weight_kg, memo")
      .eq("user_id", user!.id)
      .order("recorded_on", { ascending: false })
      .limit(30),
    supabase.from("profiles").select("goal").eq("id", user!.id).maybeSingle(),
  ]);

  const targetDate = str(searchParams.date) || today;
  const targetLog = logs?.find((l) => l.recorded_on === targetDate);
  const trend = getWeightTrend(logs?.[0]?.weight_kg, logs?.[1]?.weight_kg, profile?.goal);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">体重記録</h1>

      {error && <p className="rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark">{error}</p>}

      <form key={targetDate} action={addWeightLog} className={`${cardClass} flex flex-col gap-3`}>
        <div>
          <label htmlFor="recorded_on" className={labelClass}>
            日付
          </label>
          <input
            id="recorded_on"
            name="recorded_on"
            type="date"
            required
            defaultValue={targetDate}
            max={today}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="weight_kg" className={labelClass}>
            体重(kg)
          </label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min="0"
            required
            placeholder="例: 65.0"
            defaultValue={targetLog?.weight_kg ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="memo" className={labelClass}>
            メモ（任意）
          </label>
          <input id="memo" name="memo" type="text" defaultValue={targetLog?.memo ?? ""} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          {targetLog ? `${targetDate}の記録を更新` : `${targetDate}に記録する`}
        </button>
      </form>

      {trend && (
        <section className={cardClass}>
          <h2 className="mb-2 font-semibold">前回比</h2>
          <p className={`text-2xl font-bold ${trend.positive ? "text-success" : "text-ink"}`}>
            {trend.diffKg > 0 ? `+${trend.diffKg}` : trend.diffKg}
            <span className="ml-1 text-base font-normal text-ink-sub">kg</span>
          </p>
          <p className="mt-1 text-sm text-ink-sub">{trend.message}</p>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">記録一覧</h2>
        {logs && logs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="text-xs text-ink-muted">{log.recorded_on}</p>
                  <p className="text-lg font-semibold text-ink">{log.weight_kg} kg</p>
                  {log.memo && <p className="text-sm text-ink-sub">{log.memo}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <a href={`/weight?date=${log.recorded_on}`} className="text-sm text-info">
                    編集
                  </a>
                  <form action={deleteWeightLog}>
                    <input type="hidden" name="id" value={log.id} />
                    <button type="submit" className={dangerLinkClass}>
                      削除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">まだ記録がありません</p>
        )}
      </section>
    </div>
  );
}
