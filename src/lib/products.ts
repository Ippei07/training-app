export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  tags: string[];
};

export const products: Product[] = [
  {
    id: 1,
    name: "ホエイプロテイン(ダミー)",
    price: 3980,
    description: "筋トレ後の栄養補給に。MVPでは購入はできません。",
    tags: ["workout", "low-calorie"],
  },
  {
    id: 2,
    name: "トレーニングチューブセット(ダミー)",
    price: 2480,
    description: "自宅トレの負荷アップに。MVPでは購入はできません。",
    tags: ["workout"],
  },
  {
    id: 3,
    name: "体組成計(ダミー)",
    price: 5980,
    description: "体重・体脂肪の記録に。MVPでは購入はできません。",
    tags: ["no-weight"],
  },
];

// タグごとの「なぜおすすめか」を短く伝える一言(design.mdの文言トーン方針に沿う)
export const PRODUCT_REASONS: Record<string, string> = {
  workout: "今日は筋トレを記録しました。栄養補給の選択肢に。",
  "no-weight": "体重の記録を続けやすくするアイテムです。",
  "low-calorie": "食事量が少なめの日の栄養補給の選択肢に。",
};

export function sortProductsByRelevance(list: Product[], activeTags: Set<string>): Product[] {
  return [...list].sort((a, b) => {
    const aMatch = a.tags.some((tag) => activeTags.has(tag)) ? 1 : 0;
    const bMatch = b.tags.some((tag) => activeTags.has(tag)) ? 1 : 0;
    return bMatch - aMatch;
  });
}

export function pickHomeRecommendation(activeTags: Set<string>): {
  product: Product;
  reason: string | null;
} {
  const [top] = sortProductsByRelevance(products, activeTags);
  const matchedTag = top.tags.find((tag) => activeTags.has(tag));
  return { product: top, reason: matchedTag ? (PRODUCT_REASONS[matchedTag] ?? null) : null };
}
