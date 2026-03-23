-- Tabela de fingerprints de dispositivo
-- Permite detectar se múltiplas contas foram criadas no mesmo dispositivo

CREATE TABLE IF NOT EXISTS public.device_fingerprints (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint   text        NOT NULL,
  user_agent    text,
  created_at    timestamptz DEFAULT now(),
  last_seen_at  timestamptz DEFAULT now()
);

-- Um fingerprint único por (user_id, fingerprint) para upsert eficiente
CREATE UNIQUE INDEX IF NOT EXISTS device_fingerprints_user_fp_idx
  ON public.device_fingerprints(user_id, fingerprint);

-- Índice para busca por fingerprint (achar todos os usuários no mesmo dispositivo)
CREATE INDEX IF NOT EXISTS device_fingerprints_fp_idx
  ON public.device_fingerprints(fingerprint);

ALTER TABLE public.device_fingerprints ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado pode inserir/atualizar seus próprios fingerprints
CREATE POLICY "Users can upsert own fingerprints"
  ON public.device_fingerprints
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admin pode ver todos os fingerprints
CREATE POLICY "Admin can read all fingerprints"
  ON public.device_fingerprints
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
