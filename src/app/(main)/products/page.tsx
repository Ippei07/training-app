const products = [
  {
    id: 1,
    name: "ホエイプロテイン(ダミー)",
    price: 3980,
    description: "筋トレ後の栄養補給に。MVPでは購入はできません。",
  },
  {
    id: 2,
    name: "トレーニングチューブセット(ダミー)",
    price: 2480,
    description: "自宅トレの負荷アップに。MVPでは購入はできません。",
  },
  {
    id: 3,
    name: "体組成計(ダミー)",
    price: 5980,
    description: "体重・体脂肪の記録に。MVPでは購入はできません。",
  },
];

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">おすすめ商品</h1>
      <p className="text-sm text-gray-500">
        ※ MVPではダミー表示のみです（購入・提携リンクはありません）
      </p>
      <ul className="flex flex-col gap-3">
        {products.map((p) => (
          <li key={p.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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
        ))}
      </ul>
    </div>
  );
}
