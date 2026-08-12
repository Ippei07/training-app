"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";

export async function addMealLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const mealType = String(formData.get("meal_type") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const calorieRaw = formData.get("calorie_kcal");
  const memo = String(formData.get("memo") ?? "").trim();
  const recordedOn = String(formData.get("recorded_on") || todayISO());

  if (!content) {
    redirect(`/meals?error=${encodeURIComponent("メニューを入力してください")}`);
  }

  const { error } = await supabase.from("meal_logs").insert({
    user_id: user.id,
    recorded_on: recordedOn,
    meal_type: mealType,
    content,
    calorie_kcal: calorieRaw ? Number(calorieRaw) : null,
    memo: memo || null,
  });

  if (error) {
    redirect(`/meals?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/meals");
  revalidatePath("/");
  redirect("/meals");
}

export async function deleteMealLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await supabase.from("meal_logs").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/meals");
  revalidatePath("/");
  redirect("/meals");
}
