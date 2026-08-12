import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { addWorkoutLog, deleteWorkoutLog } from "@/app/actions/workouts";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default async function WorkoutsPage(props: PageProps<"/workouts">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();

  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id, recorded_on, exercise_name, sets, reps, weight_kg, memo")
    .eq("user_id", user!.id)
    .order("recorded_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">筋トレ記録</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form action={addWorkoutLog} className={`${cardClass} flex flex-col gap-3`}>
        <input type="hidden" name="recorded_on" value={today} />
        <div>
          <label htmlFor="exercise_name" className={labelClass}>種目</label>
          <input
            id="exercise_name"
            name="exercise_name"
            type="text"
            required
            placeholder="例: スクワット"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="sets" className={labelClass}>セット</label>
            <input id="sets" name="sets" type="number" min="0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="reps" className={labelClass}>回数</label>
            <input id="reps" name="reps" type="number" min="0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="weight_kg" className={labelClass}>重量(kg)</label>
            <input id="weight_kg" name="weight_kg" type="number" step="0.5" min="0" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="memo" className={labelClass}>メモ（任意）</label>
          <input id="memo" name="memo" type="text" className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          記録する
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">記録一覧</h2>
        {logs && logs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-start justify-between`}>
                <div>
                  <p className="text-sm text-gray-500">{log.recorded_on}</p>
                  <p className="font-medium">{log.exercise_name}</p>
                  <p className="text-sm text-gray-500">
                    {log.sets ? `${log.sets}セット` : ""}
                    {log.reps ? ` × ${log.reps}回` : ""}
                    {log.weight_kg ? ` × ${log.weight_kg}kg` : ""}
                  </p>
                  {log.memo && <p className="text-sm text-gray-500">{log.memo}</p>}
                </div>
                <form action={deleteWorkoutLog}>
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
