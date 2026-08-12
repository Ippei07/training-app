import { completeOnboarding } from "@/app/actions/profile";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default async function OnboardingPage(props: PageProps<"/onboarding">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-2 text-2xl font-bold">初期設定</h1>
        <p className="mb-6 text-sm text-gray-500">
          記録をはじめる前に、簡単なプロフィールを入力してください。
        </p>
        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        <form action={completeOnboarding} className="flex flex-col gap-4">
          <div>
            <label htmlFor="gender" className={labelClass}>性別</label>
            <select id="gender" name="gender" className={inputClass} defaultValue="">
              <option value="">選択しない</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label htmlFor="birth_date" className={labelClass}>生年月日</label>
            <input id="birth_date" name="birth_date" type="date" className={inputClass} />
          </div>
          <div>
            <label htmlFor="height_cm" className={labelClass}>身長(cm)</label>
            <input id="height_cm" name="height_cm" type="number" step="0.1" min="0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="weight_kg" className={labelClass}>現在の体重(kg)</label>
            <input id="weight_kg" name="weight_kg" type="number" step="0.1" min="0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="goal" className={labelClass}>目標</label>
            <select id="goal" name="goal" required className={inputClass} defaultValue="maintain">
              <option value="lose">減量</option>
              <option value="maintain">維持</option>
              <option value="gain">増量</option>
            </select>
          </div>
          <button type="submit" className={primaryButtonClass}>はじめる</button>
        </form>
      </div>
    </div>
  );
}
