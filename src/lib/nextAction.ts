type NextActionContext = {
  hasWeightToday: boolean;
  hasMealToday: boolean;
  hasWorkoutToday: boolean;
};

export type NextAction = {
  message: string;
  href: "/weight" | "/meals" | "/workouts";
  label: string;
} | null;

export function getNextAction(ctx: NextActionContext): NextAction {
  if (!ctx.hasWeightToday) {
    return { message: "今日はまだ体重を記録していません", href: "/weight", label: "体重を記録する" };
  }
  if (!ctx.hasMealToday) {
    return { message: "今日の食事はまだ記録していません", href: "/meals", label: "食事を記録する" };
  }
  if (!ctx.hasWorkoutToday) {
    return { message: "今日はまだ筋トレを記録していません", href: "/workouts", label: "筋トレを記録する" };
  }
  return null;
}
