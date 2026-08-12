-- MVP用DBスキーマ
-- Supabaseダッシュボードの SQL Editor で実行してください。

-- 1. profiles: 初期設定情報
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  gender text check (gender in ('male', 'female', 'other')),
  birth_date date,
  height_cm numeric,
  goal text check (goal in ('lose', 'maintain', 'gain')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2. weight_logs: 体重記録
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_on date not null,
  weight_kg numeric not null,
  memo text,
  created_at timestamptz not null default now(),
  unique (user_id, recorded_on)
);

alter table public.weight_logs enable row level security;

create policy "weight_logs_select_own" on public.weight_logs
  for select using (auth.uid() = user_id);

create policy "weight_logs_insert_own" on public.weight_logs
  for insert with check (auth.uid() = user_id);

create policy "weight_logs_update_own" on public.weight_logs
  for update using (auth.uid() = user_id);

create policy "weight_logs_delete_own" on public.weight_logs
  for delete using (auth.uid() = user_id);

-- 3. meal_logs: 食事記録
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_on date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  content text not null,
  calorie_kcal integer,
  memo text,
  created_at timestamptz not null default now()
);

alter table public.meal_logs enable row level security;

create policy "meal_logs_select_own" on public.meal_logs
  for select using (auth.uid() = user_id);

create policy "meal_logs_insert_own" on public.meal_logs
  for insert with check (auth.uid() = user_id);

create policy "meal_logs_update_own" on public.meal_logs
  for update using (auth.uid() = user_id);

create policy "meal_logs_delete_own" on public.meal_logs
  for delete using (auth.uid() = user_id);

-- 4. workout_logs: 筋トレ記録
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_on date not null,
  exercise_name text not null,
  sets integer,
  reps integer,
  weight_kg numeric,
  memo text,
  created_at timestamptz not null default now()
);

alter table public.workout_logs enable row level security;

create policy "workout_logs_select_own" on public.workout_logs
  for select using (auth.uid() = user_id);

create policy "workout_logs_insert_own" on public.workout_logs
  for insert with check (auth.uid() = user_id);

create policy "workout_logs_update_own" on public.workout_logs
  for update using (auth.uid() = user_id);

create policy "workout_logs_delete_own" on public.workout_logs
  for delete using (auth.uid() = user_id);

-- 5. 参照用インデックス（日付での絞り込みが多いため）
create index if not exists weight_logs_user_date_idx on public.weight_logs (user_id, recorded_on desc);
create index if not exists meal_logs_user_date_idx on public.meal_logs (user_id, recorded_on desc);
create index if not exists workout_logs_user_date_idx on public.workout_logs (user_id, recorded_on desc);
