-- B11: Trigger para auto-atualizar updated_at em links e profiles

-- Função genérica de trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger na tabela links (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'links_set_updated_at'
    AND tgrelid = 'public.links'::regclass
  ) THEN
    CREATE TRIGGER links_set_updated_at
      BEFORE UPDATE ON public.links
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Trigger na tabela profiles (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'profiles_set_updated_at'
    AND tgrelid = 'public.profiles'::regclass
  ) THEN
    CREATE TRIGGER profiles_set_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;
