export type WeightTrend = {
  diffKg: number;
  message: string;
  positive: boolean;
};

// 目標(減量/維持/増量)に応じて、増減を前向きな一言に変換する。
// 赤は使わず、順調な時は緑、それ以外は通常の文字色で表現する(増減を赤だけで表さない)。
export function getWeightTrend(
  latestKg: number | null | undefined,
  previousKg: number | null | undefined,
  goal: string | null | undefined,
): WeightTrend | null {
  if (latestKg == null || previousKg == null) return null;

  const diffKg = Math.round((latestKg - previousKg) * 10) / 10;

  if (diffKg === 0) {
    return { diffKg, message: "前回と同じ体重です。ペースを維持できています。", positive: true };
  }

  const decreasing = diffKg < 0;
  const alignedWithGoal =
    goal === "lose" ? decreasing : goal === "gain" ? !decreasing : Math.abs(diffKg) <= 0.3;

  if (alignedWithGoal) {
    return {
      diffKg,
      message: goal === "gain" ? "前回より増えています。順調です。" : "前回より減っています。順調です。",
      positive: true,
    };
  }

  return {
    diffKg,
    message: "今回は前回と差がありますが、記録を続けることが大切です。",
    positive: false,
  };
}
