import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default async function SignupPage(props: PageProps<"/signup">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">新規登録</h1>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <form action={signup} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>メールアドレス</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>パスワード（8文字以上）</label>
            <input id="password" name="password" type="password" required minLength={8} className={inputClass} />
          </div>
          <button type="submit" className={primaryButtonClass}>登録する</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-medium text-black underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
