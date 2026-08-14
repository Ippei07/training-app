"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "ホーム" },
  { href: "/meals", label: "食事" },
  { href: "/workouts", label: "筋トレ" },
  { href: "/weight", label: "体重" },
  { href: "/products", label: "商品" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md border-t border-gray-200 bg-white">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center py-2 text-xs ${
              active ? "font-semibold text-primary" : "text-ink-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
