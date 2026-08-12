import Link from "next/link";
import { login } from "@/app/actions/auth";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;
  const message = typeof searchParams.message === "string" ? searchParams.message : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">ログイン</h1>
        {message && (
          <p className="mb-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>
        )}
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <form action={login} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>メールアドレス</label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>パスワード</label>
            <input id="password" name="password" type="password" required minLength={6} className={inputClass} />
          </div>
          <button type="submit" className={primaryButtonClass}>ログイン</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="font-medium text-black underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
