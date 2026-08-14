import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayISO, daysAgoISO, formatDateJa, greetingForNow } from "@/lib/date";
import { buildTomorrowTasks } from "@/lib/tomorrowTasks";
import { getNextAction } from "@/lib/nextAction";
import { pickHomeRecommendation } from "@/lib/products";
import { cardClass, primaryButtonClass, recordButtonClass, badgeDoneClass, badgeMutedClass } from "@/lib/ui";

function StatusRow({
  label,
  done,
  detail,
  href,
}: {
  label: string;
  done: boolean;
  detail?: string;
  href: "/weight" | "/meals" | "/workouts";
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium text-ink">{label}</span>
          <span className={done ? badgeDoneClass : badgeMutedClass}>{done ? "入力済み" : "未入力"}</span>
        </div>
        {detail && <p className="truncate text-sm text-ink-sub">{detail}</p>}
      </div>
      <Link href={href} className={recordButtonClass}>
        記録する
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();
  const weekStart = daysAgoISO(6);

  const [
    { data: weight },
    { data: meals },
    { data: workouts },
    { count: workoutCountWeek },
    { data: mealDaysRaw },
  ] = await Promise.all([
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
    supabase
      .from("workout_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id)
      .gte("recorded_on", weekStart),
    supabase.from("meal_logs").select("recorded_on").eq("user_id", user!.id).gte("recorded_on", weekStart),
  ]);

  const hasWeight = !!weight;
  const hasMeal = (meals?.length ?? 0) > 0;
  const hasWorkout = (workouts?.length ?? 0) > 0;
  const totalCalorie = (meals ?? []).reduce((sum, m) => sum + (m.calorie_kcal ?? 0), 0);
  const mealDaysWeek = new Set((mealDaysRaw ?? []).map((m) => m.recorded_on)).size;

  const nextAction = getNextAction({ hasWeightToday: hasWeight, hasMealToday: hasMeal, hasWorkoutToday: hasWorkout });
  const tomorrowTasks = buildTomorrowTasks({
    hasWeightToday: hasWeight,
    hasWorkoutToday: hasWorkout,
    mealCount: meals?.length ?? 0,
  });

  const activeTags = new Set<string>();
  if (hasWorkout) activeTags.add("workout");
  if (!hasWeight) activeTags.add("no-weight");
  if (!hasMeal || totalCalorie < 1200) activeTags.add("low-calorie");
  const { product: recommendedProduct, reason: productReason } = pickHomeRecommendation(activeTags);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-sm text-ink-sub">{greetingForNow()}</p>
        <h1 className="text-xl font-bold">{formatDateJa(today)}</h1>
      </div>

      <section className="rounded-xl border border-border bg-section-bg p-4">
        {nextAction ? (
          <>
            <p className="mb-3 font-medium text-ink">{nextAction.message}</p>
            <Link href={nextAction.href} className={primaryButtonClass}>
              {nextAction.label}
            </Link>
          </>
        ) : (
          <p className="font-medium text-ink">今日の記録はすべて完了しました。お疲れ様でした！</p>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="mb-1 font-semibold">今日の記録状況</h2>
        <div className="flex flex-col divide-y divide-border">
          <StatusRow label="体重" done={hasWeight} detail={hasWeight ? `${weight.weight_kg} kg` : undefined} href="/weight" />
          <StatusRow
            label="食事"
            done={hasMeal}
            detail={hasMeal ? `合計 ${totalCalorie} kcal` : undefined}
            href="/meals"
          />
          <StatusRow
            label="筋トレ"
            done={hasWorkout}
            detail={hasWorkout ? `${workouts!.length}種目` : undefined}
            href="/workouts"
          />
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="mb-2 font-semibold">明日やること</h2>
        <ul className="flex flex-col gap-1.5">
          {tomorrowTasks.map((task, i) => (
            <li key={task} className="text-sm text-ink">
              {i + 1}. {task}
            </li>
          ))}
        </ul>
      </section>

      <section className={cardClass}>
        <h2 className="mb-3 font-semibold">今週の進捗</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-ink">
              {workoutCountWeek ?? 0}
              <span className="ml-1 text-sm font-normal text-ink-sub">回</span>
            </p>
            <p className="text-xs text-ink-sub">今週の筋トレ</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ink">
              {mealDaysWeek}
              <span className="ml-1 text-sm font-normal text-ink-sub">日</span>
            </p>
            <p className="text-xs text-ink-sub">今週の食事記録日数</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card-bg p-4">
        <p className="text-xs text-ink-sub">{productReason ?? "毎日の記録をサポートするアイテム"}</p>
        <p className="mt-1 font-medium text-ink">{recommendedProduct.name}</p>
        <Link href="/products" className="mt-2 inline-block text-sm text-info">
          商品を見る
        </Link>
      </section>
    </div>
  );
}
