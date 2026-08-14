export const inputClass =
  "min-h-11 w-full rounded-lg border border-border bg-card-bg px-3 py-2 text-base text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
export const labelClass = "mb-1 block text-sm font-medium text-ink-sub";

// 主要CTA。高さ44px以上を確保(min-h-11 = 44px)。赤の面積が広がりすぎないよう単色塗りのみに留める。
export const primaryButtonClass =
  "flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-center font-semibold text-white active:bg-primary-dark";

export const secondaryButtonClass =
  "flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-card-bg px-4 text-center font-medium text-ink active:bg-gray-50";

export const cardClass = "rounded-xl border border-border bg-card-bg p-4 shadow-sm";

// 削除・退会などの危険操作用。Primary Redの単色塗りとは形(薄い背景のチップ)で明確に区別し、
// 色だけで判断させないよう常に文言(削除 等)とセットで使う前提。
export const dangerLinkClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-primary-light px-3 text-sm font-medium text-primary-dark active:bg-primary-light/70";

// カード内の行に添える「記録する」等の小さめCTA。塗りではなく輪郭のみにして赤の面積を抑える。
export const recordButtonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary active:bg-primary-light";

// バッジ(design.md: 入力済み・完了=緑 / 未入力=グレー / 今日・重要=赤 / 情報=青)
export const badgeDoneClass =
  "inline-flex items-center rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success";
export const badgeMutedClass =
  "inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-ink-muted";
export const badgeTodayClass =
  "inline-flex items-center rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-dark";
