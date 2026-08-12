import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions/profile";
import { logout } from "@/app/actions/auth";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default async function SettingsPage(props: PageProps<"/settings">) {
  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("gender, birth_date, height_cm, goal")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-xl font-bold">設定</h1>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form action={updateProfile} className="flex flex-col gap-4">
        <div>
          <label htmlFor="gender" className={labelClass}>性別</label>
          <select id="gender" name="gender" className={inputClass} defaultValue={profile?.gender ?? ""}>
            <option value="">選択しない</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </div>
        <div>
          <label htmlFor="birth_date" className={labelClass}>生年月日</label>
          <input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={profile?.birth_date ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="height_cm" className={labelClass}>身長(cm)</label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            step="0.1"
            min="0"
            defaultValue={profile?.height_cm ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="goal" className={labelClass}>目標</label>
          <select id="goal" name="goal" required className={inputClass} defaultValue={profile?.goal ?? "maintain"}>
            <option value="lose">減量</option>
            <option value="maintain">維持</option>
            <option value="gain">増量</option>
          </select>
        </div>
        <button type="submit" className={primaryButtonClass}>
          更新する
        </button>
      </form>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-center font-medium text-gray-700"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
