-- Create user_profiles table to store onboarding data
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,

  -- Basic info
  age integer,
  symptoms_start_date text,

  -- Menopause stage
  menopause_stage text,

  -- Symptoms
  primary_symptoms text[],
  symptom_severity text,

  -- Treatment info
  on_hrt boolean,
  hrt_type text[],
  other_hrt text,
  other_treatments text[],
  other_supplements text,

  -- Goals
  main_goal text,

  -- Onboarding tracking
  onboarding_completed boolean default false,
  onboarding_completed_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;

-- Create policies
-- Users can read their own profile
create policy "Users can view own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.user_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to update updated_at on row update
create trigger set_updated_at
  before update on public.user_profiles
  for each row
  execute function public.handle_updated_at();

-- Create index on user_id for faster lookups
create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);
