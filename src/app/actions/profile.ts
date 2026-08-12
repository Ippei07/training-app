"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/date";

async function saveProfile(formData: FormData): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const gender = String(formData.get("gender") ?? "");
  const birthDate = String(formData.get("birth_date") ?? "");
  const heightCm = formData.get("height_cm");
  const goal = String(formData.get("goal") ?? "");
  const weightKg = formData.get("weight_kg");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    gender: gender || null,
    birth_date: birthDate || null,
    height_cm: heightCm ? Number(heightCm) : null,
    goal: goal || null,
    onboarded_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  if (weightKg) {
    await supabase.from("weight_logs").upsert(
      {
        user_id: user.id,
        recorded_on: todayISO(),
        weight_kg: Number(weightKg),
      },
      { onConflict: "user_id,recorded_on" },
    );
  }

  return { error: null };
}

export async function completeOnboarding(formData: FormData) {
  const result = await saveProfile(formData);
  if (result.error) {
    redirect(`/onboarding?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const result = await saveProfile(formData);
  if (result.error) {
    redirect(`/settings?error=${encodeURIComponent(result.error)}`);
  }
  redirect("/settings");
}
