"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";

export async function addWeightLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const weightKg = Number(formData.get("weight_kg"));
  const recordedOn = String(formData.get("recorded_on") || todayISO());
  const memo = String(formData.get("memo") ?? "").trim();

  if (!weightKg || weightKg <= 0) {
    redirect(`/weight?error=${encodeURIComponent("体重を正しく入力してください")}`);
  }

  const { error } = await supabase.from("weight_logs").upsert(
    {
      user_id: user.id,
      recorded_on: recordedOn,
      weight_kg: weightKg,
      memo: memo || null,
    },
    { onConflict: "user_id,recorded_on" },
  );

  if (error) {
    redirect(`/weight?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/weight");
  revalidatePath("/");
  redirect("/weight");
}

export async function deleteWeightLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/weight");
  revalidatePath("/");
  redirect("/weight");
}
