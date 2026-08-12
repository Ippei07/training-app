import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { addMealLog, deleteMealLog } from "@/app/actions/meals";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

const mealTypeLabel: Record<string, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

export default async function MealsPage(props: PageProps<"/meals">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();

  const { data: logs } = await supabase
    .from("meal_logs")
    .select("id, recorded_on, meal_type, content, calorie_kcal, memo")
    .eq("user_id", user!.id)
    .order("recorded_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">食事記録</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form action={addMealLog} className={`${cardClass} flex flex-col gap-3`}>
        <div>
          <label htmlFor="recorded_on" className={labelClass}>日付</label>
          <input
            id="recorded_on"
            name="recorded_on"
            type="date"
            required
            defaultValue={today}
            max={today}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="meal_type" className={labelClass}>区分</label>
          <select id="meal_type" name="meal_type" required className={inputClass} defaultValue="">
            <option value="" disabled>
              選択してください
            </option>
            <option value="breakfast">朝食</option>
            <option value="lunch">昼食</option>
            <option value="dinner">夕食</option>
            <option value="snack">間食</option>
          </select>
        </div>
        <div>
          <label htmlFor="content" className={labelClass}>メニュー</label>
          <input
            id="content"
            name="content"
            type="text"
            required
            placeholder="例: 鶏むね肉のサラダ"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="calorie_kcal" className={labelClass}>カロリー(kcal・任意)</label>
          <input id="calorie_kcal" name="calorie_kcal" type="number" min="0" className={inputClass} />
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
                  <p className="text-sm text-gray-500">
                    {log.recorded_on}・{mealTypeLabel[log.meal_type] ?? log.meal_type}
                  </p>
                  <p className="font-medium">{log.content}</p>
                  {log.calorie_kcal !== null && (
                    <p className="text-sm text-gray-500">{log.calorie_kcal} kcal</p>
                  )}
                  {log.memo && <p className="text-sm text-gray-500">{log.memo}</p>}
                </div>
                <form action={deleteMealLog}>
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
