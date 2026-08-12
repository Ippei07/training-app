import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { buildTomorrowTasks } from "@/lib/tomorrowTasks";
import { cardClass } from "@/lib/ui";

const mealTypeLabel: Record<string, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();

  const [{ data: weight }, { data: meals }, { data: workouts }] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("weight_kg, memo")
      .eq("user_id", user!.id)
      .eq("recorded_on", today)
      .maybeSingle(),
    supabase
      .from("meal_logs")
      .select("id, meal_type, content, calorie_kcal")
      .eq("user_id", user!.id)
      .eq("recorded_on", today)
      .order("created_at"),
    supabase
      .from("workout_logs")
      .select("id, exercise_name, sets, reps, weight_kg")
      .eq("user_id", user!.id)
      .eq("recorded_on", today)
      .order("created_at"),
  ]);

  const totalCalorie = (meals ?? []).reduce((sum, m) => sum + (m.calorie_kcal ?? 0), 0);
  const tomorrowTasks = buildTomorrowTasks({
    hasWeightToday: !!weight,
    hasWorkoutToday: (workouts?.length ?? 0) > 0,
    mealCount: meals?.length ?? 0,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-xl font-bold">今日の振り返り</h1>
        <p className="text-sm text-gray-500">{today}</p>
      </div>

      <section className={cardClass}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">体重</h2>
          <Link href="/weight" className="text-sm text-blue-600">
            記録する
          </Link>
        </div>
        {weight ? (
          <p className="text-2xl font-bold">{weight.weight_kg} kg</p>
        ) : (
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        )}
      </section>

      <section className={cardClass}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">
            食事{meals && meals.length > 0 ? `（合計 ${totalCalorie} kcal）` : ""}
          </h2>
          <Link href="/meals" className="text-sm text-blue-600">
            記録する
          </Link>
        </div>
        {meals && meals.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {meals.map((meal) => (
              <li key={meal.id} className="text-sm">
                <span className="text-gray-500">{mealTypeLabel[meal.meal_type] ?? meal.meal_type}</span>{" "}
                {meal.content}
                {meal.calorie_kcal ? `（${meal.calorie_kcal}kcal）` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        )}
      </section>

      <section className={cardClass}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">筋トレ</h2>
          <Link href="/workouts" className="text-sm text-blue-600">
            記録する
          </Link>
        </div>
        {workouts && workouts.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {workouts.map((w) => (
              <li key={w.id} className="text-sm">
                {w.exercise_name}
                {w.sets ? ` ${w.sets}セット` : ""}
                {w.reps ? ` × ${w.reps}回` : ""}
                {w.weight_kg ? ` × ${w.weight_kg}kg` : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="mb-2 font-semibold">明日やること</h2>
        <ul className="flex flex-col gap-1">
          {tomorrowTasks.map((task) => (
            <li key={task} className="text-sm">
              ・{task}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
