"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";

export async function addWorkoutLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const exerciseName = String(formData.get("exercise_name") ?? "").trim();
  const setsRaw = formData.get("sets");
  const repsRaw = formData.get("reps");
  const weightRaw = formData.get("weight_kg");
  const memo = String(formData.get("memo") ?? "").trim();
  const recordedOn = String(formData.get("recorded_on") || todayISO());

  if (!exerciseName) {
    redirect(`/workouts?error=${encodeURIComponent("種目を入力してください")}`);
  }

  const { error } = await supabase.from("workout_logs").insert({
    user_id: user.id,
    recorded_on: recordedOn,
    exercise_name: exerciseName,
    sets: setsRaw ? Number(setsRaw) : null,
    reps: repsRaw ? Number(repsRaw) : null,
    weight_kg: weightRaw ? Number(weightRaw) : null,
    memo: memo || null,
  });

  if (error) {
    redirect(`/workouts?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/workouts");
  revalidatePath("/");
  redirect("/workouts");
}

export async function deleteWorkoutLog(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await supabase.from("workout_logs").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/workouts");
  revalidatePath("/");
  redirect("/workouts");
}
