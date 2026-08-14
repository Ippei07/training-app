import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { addWorkoutLog, deleteWorkoutLog } from "@/app/actions/workouts";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  cardClass,
  dangerLinkClass,
  recordButtonClass,
  badgeDoneClass,
} from "@/lib/ui";

type WorkoutLogRow = {
  id: string;
  recorded_on: string;
  exercise_name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  memo: string | null;
};

function str(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function formatSetLine(log: WorkoutLogRow): string {
  const parts: string[] = [];
  if (log.weight_kg) parts.push(`${log.weight_kg}kg`);
  if (log.reps) parts.push(`${log.reps}回`);
  if (log.sets) parts.push(`${log.sets}セット`);
  return parts.join(" × ");
}

// logsは日付降順で並んでいる前提。currentより後ろで最初に一致する同じ種目が「前回の前回」。
function findPreviousRecord(logs: WorkoutLogRow[], current: WorkoutLogRow): WorkoutLogRow | undefined {
  const idx = logs.findIndex((l) => l.id === current.id);
  return logs.slice(idx + 1).find((l) => l.exercise_name === current.exercise_name);
}

// 高度な分析はせず、「前回より増えたか」だけを見るシンプルな比較。
function getImprovementLabel(current: WorkoutLogRow, previous?: WorkoutLogRow): string | null {
  if (!previous) return null;
  if (current.weight_kg != null && previous.weight_kg != null && current.weight_kg > previous.weight_kg) {
    return "前回より重量UP";
  }
  if (current.reps != null && previous.reps != null && current.reps > previous.reps) {
    return "前回より回数UP";
  }
  return null;
}

export default async function WorkoutsPage(props: PageProps<"/workouts">) {
  const searchParams = await props.searchParams;
  const error = str(searchParams.error) || undefined;
  const saved = str(searchParams.saved) === "1";
  const prefillExercise = str(searchParams.exercise);
  const prefillSets = str(searchParams.sets);
  const prefillReps = str(searchParams.reps);
  const prefillWeight = str(searchParams.weight_kg);

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

  const recentExercises: WorkoutLogRow[] = [];
  const seenExercises = new Set<string>();
  for (const log of logs ?? []) {
    if (seenExercises.has(log.exercise_name)) continue;
    seenExercises.add(log.exercise_name);
    recentExercises.push(log);
    if (recentExercises.length >= 4) break;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">筋トレ記録</h1>

      {saved && (
        <p className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          記録を保存しました。お疲れ様でした！
        </p>
      )}
      {error && <p className="rounded-lg bg-primary-light px-4 py-3 text-sm text-primary-dark">{error}</p>}

      <form
        key={`${prefillExercise}|${prefillSets}|${prefillReps}|${prefillWeight}`}
        action={addWorkoutLog}
        className={`${cardClass} flex flex-col gap-4`}
      >
        <div>
          <label htmlFor="recorded_on" className={labelClass}>
            日付
          </label>
          <input
            id="recorded_on"
            name="recorded_on"
            type="date"
            required
            defaultValue={today}
            max={today}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink-muted">過去の日付でも記録できます</p>
        </div>
        <div>
          <label htmlFor="exercise_name" className={labelClass}>
            種目名
          </label>
          <input
            id="exercise_name"
            name="exercise_name"
            type="text"
            required
            placeholder="例: スクワット"
            defaultValue={prefillExercise}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="weight_kg" className={labelClass}>
            重量(kg)
          </label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.5"
            min="0"
            placeholder="例: 40"
            defaultValue={prefillWeight}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="reps" className={labelClass}>
            回数
          </label>
          <input
            id="reps"
            name="reps"
            type="number"
            min="0"
            placeholder="例: 10"
            defaultValue={prefillReps}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sets" className={labelClass}>
            セット数
          </label>
          <input
            id="sets"
            name="sets"
            type="number"
            min="0"
            placeholder="例: 3"
            defaultValue={prefillSets}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="memo" className={labelClass}>
            メモ（任意）
          </label>
          <input id="memo" name="memo" type="text" placeholder="例: フォーム重視" className={inputClass} />
        </div>
        <button type="submit" className={primaryButtonClass}>
          記録する
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">前回の記録</h2>
        {recentExercises.length === 0 ? (
          <div className={`${cardClass} text-sm text-ink-sub`}>
            まだ記録がありません。まずは1種目、無理のない重量で記録してみましょう。
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentExercises.map((log) => {
              const previous = findPreviousRecord(logs ?? [], log);
              const improvement = getImprovementLabel(log, previous);
              const params = new URLSearchParams({ exercise: log.exercise_name });
              if (log.sets) params.set("sets", String(log.sets));
              if (log.reps) params.set("reps", String(log.reps));
              if (log.weight_kg) params.set("weight_kg", String(log.weight_kg));

              return (
                <li key={log.id} className={cardClass}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{log.exercise_name}</p>
                      <p className="mt-1 text-xl font-bold text-ink">前回: {formatSetLine(log)}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs text-ink-muted">{log.recorded_on}</p>
                        {improvement && <span className={badgeDoneClass}>{improvement}</span>}
                      </div>
                    </div>
                    <a href={`/workouts?${params.toString()}`} className={recordButtonClass}>
                      この内容を入力
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">記録一覧</h2>
        {logs && logs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className={`${cardClass} flex items-start justify-between gap-3`}>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{log.exercise_name}</p>
                  <p className="text-base font-medium text-ink">{formatSetLine(log)}</p>
                  <p className="mt-1 text-xs text-ink-muted">{log.recorded_on}</p>
                  {log.memo && <p className="text-xs text-ink-muted">{log.memo}</p>}
                </div>
                <form action={deleteWorkoutLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <button type="submit" className={dangerLinkClass}>
                    削除
                  </button>
                </form>
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
