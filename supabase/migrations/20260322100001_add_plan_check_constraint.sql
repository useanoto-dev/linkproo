-- A1: Adicionar CHECK constraint no campo plan para evitar valores arbitrários
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_plan_check'
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_plan_check
    CHECK (plan IN ('free', 'pro', 'business', 'admin'));
  END IF;
END $$;
