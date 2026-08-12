type TomorrowContext = {
  hasWeightToday: boolean;
  hasWorkoutToday: boolean;
  mealCount: number;
};

const FILLER_TASKS = [
  "同じ時間に記録する習慣をつけましょう",
  "水分をしっかり摂りましょう",
  "睡眠時間を確保しましょう",
  "無理のない範囲で体を動かしましょう",
];

export function buildTomorrowTasks(ctx: TomorrowContext): string[] {
  const tasks: string[] = [];

  if (!ctx.hasWeightToday) {
    tasks.push("体重を記録しましょう（変化が見えるとモチベーションが続きます）");
  }

  if (!ctx.hasWorkoutToday) {
    tasks.push("軽くてもいいので筋トレを1種目やってみましょう");
  } else {
    tasks.push("今日鍛えた部位を連日追い込みすぎないよう、しっかり休ませましょう");
  }

  if (ctx.mealCount === 0) {
    tasks.push("食事の記録を忘れずに残しましょう");
  }

  for (const filler of FILLER_TASKS) {
    if (tasks.length >= 3) break;
    if (!tasks.includes(filler)) tasks.push(filler);
  }

  return tasks.slice(0, 3);
}
