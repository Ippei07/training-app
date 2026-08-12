import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { addWeightLog, deleteWeightLog } from "@/app/actions/weight";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

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

  const { data: logs } = await supabase
    .from("weight_logs")
    .select("id, recorded_on, weight_kg, memo")
    .eq("user_id", user!.id)
    .order("recorded_on", { ascending: false })
    .limit(30);

  const targetDate = str(searchParams.date) || today;
  const targetLog = logs?.find((l) => l.recorded_on === targetDate);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">体重記録</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form key={targetDate} action={addWeightLog} className={`${cardClass} flex flex-col gap-3`}>
        <div>
          <label htmlFor="recorded_on" className={labelClass}>日付</label>
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
          <label htmlFor="weight_kg" className={labelClass}>体重(kg)</label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min="0"
            required
            defaultValue={targetLog?.weight_kg ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="memo" className={labelClass}>メモ（任意）</label>
          <input id="memo" name="memo" type="text" defaultValue={targetLog?.memo ?? ""} className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          {targetLog ? `${targetDate}の記録を更新` : `${targetDate}に記録する`}
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
                <div className="flex items-center gap-3">
                  <a href={`/weight?date=${log.recorded_on}`} className="text-sm text-blue-600">
                    編集
                  </a>
                  <form action={deleteWeightLog}>
                    <input type="hidden" name="id" value={log.id} />
                    <button type="submit" className="text-sm text-red-500">
                      削除
                    </button>
                  </form>
                </div>
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
