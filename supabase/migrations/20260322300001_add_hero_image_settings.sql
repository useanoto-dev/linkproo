-- Cria colunas para as configurações de imagem do banner (hero):
--   hero_image_height_px  INTEGER  — altura em px (padrão 192)
--   hero_object_fit       TEXT     — 'cover' | 'contain' | 'fill'
--   hero_focal_point      JSONB    — { x: number, y: number } (0–100 cada eixo)
--
-- Nota: a migration 20260322200001 tentou migrar dados para hero_image_height_px
-- mas a coluna ainda não existia. Esta migration cria as colunas de forma idempotente
-- e realiza a migração de dados pendente.

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS hero_image_height_px integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hero_object_fit      text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS hero_focal_point     jsonb   DEFAULT NULL;

-- Migra dados legados de hero_image_height (TEXT) → hero_image_height_px (INTEGER)
-- apenas para linhas que ainda não têm o novo valor preenchido.
UPDATE public.links
SET hero_image_height_px = CASE hero_image_height
  WHEN 'sm'   THEN 128
  WHEN 'md'   THEN 192
  WHEN 'lg'   THEN 256
  WHEN 'xl'   THEN 320
  WHEN 'auto' THEN NULL
  ELSE NULL
END
WHERE hero_image_height IS NOT NULL
  AND hero_image_height_px IS NULL;
