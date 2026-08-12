import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { addWeightLog, deleteWeightLog } from "@/app/actions/weight";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default async function WeightPage(props: PageProps<"/weight">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();

  const { data: logs } = await supabase
    .from("weight_logs")
    .select("id, recorded_on, weight_kg, memo")
    .eq("user_id", user!.id)
    .order("recorded_on", { ascending: false })
    .limit(30);

  const todayLog = logs?.find((l) => l.recorded_on === today);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">体重記録</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form action={addWeightLog} className={`${cardClass} flex flex-col gap-3`}>
        <input type="hidden" name="recorded_on" value={today} />
        <div>
          <label htmlFor="weight_kg" className={labelClass}>
            体重(kg) - {today}
          </label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={todayLog?.weight_kg ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="memo" className={labelClass}>メモ（任意）</label>
          <input id="memo" name="memo" type="text" defaultValue={todayLog?.memo ?? ""} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          {todayLog ? "今日の記録を更新" : "記録する"}
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">記録一覧</h2>
        {logs && logs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-center justify-between`}>
                <div>
                  <p className="text-sm text-gray-500">{log.recorded_on}</p>
                  <p className="text-lg font-semibold">{log.weight_kg} kg</p>
                  {log.memo && <p className="text-sm text-gray-500">{log.memo}</p>}
                </div>
                <form action={deleteWeightLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <button type="submit" className="text-sm text-red-500">
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        )}
      </section>
    </div>
  );
}
