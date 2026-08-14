import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";
import { products, sortProductsByRelevance } from "@/lib/products";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = todayISO();

  const [{ data: weight }, { data: meals }, { data: workouts }] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("id")
      .eq("user_id", user!.id)
      .eq("recorded_on", today)
      .maybeSingle(),
    supabase
      .from("meal_logs")
      .select("calorie_kcal")
      .eq("user_id", user!.id)
      .eq("recorded_on", today),
    supabase
      .from("workout_logs")
      .select("id")
      .eq("user_id", user!.id)
      .eq("recorded_on", today)
      .limit(1),
  ]);

  const totalCalorie = (meals ?? []).reduce((sum, m) => sum + (m.calorie_kcal ?? 0), 0);

  const activeTags = new Set<string>();
  if ((workouts?.length ?? 0) > 0) activeTags.add("workout");
  if (!weight) activeTags.add("no-weight");
  if ((meals?.length ?? 0) === 0 || totalCalorie < 1200) activeTags.add("low-calorie");

  const sortedProducts = sortProductsByRelevance(products, activeTags);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">おすすめ商品</h1>
      <p className="text-sm text-gray-500">
        ※ MVPではダミー表示のみです（購入・提携リンクはありません）
      </p>
      <ul className="flex flex-col gap-3">
        {sortedProducts.map((p) => {
          const isRecommended = p.tags.some((tag) => activeTags.has(tag));
          return (
            <li key={p.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              {isRecommended && (
                <p className="mb-2 inline-block rounded-full bg-black px-2 py-0.5 text-xs text-white">
                  今日の記録からおすすめ
                </p>
              )}
              <div className="mb-2 flex h-32 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                画像準備中
              </div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm text-gray-500">{p.description}</p>
              <p className="mt-2 font-bold">¥{p.price.toLocaleString()}</p>
              <button
                disabled
                className="mt-3 w-full cursor-not-allowed rounded-md bg-gray-200 px-4 py-2 text-center text-gray-500"
              >
                購入(準備中)
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
