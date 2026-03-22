-- Migra dados do campo legado hero_image_height (TEXT: 'sm'|'md'|'lg'|'xl'|'auto')
-- para o campo novo hero_image_height_px (INTEGER).
-- Mapa usado no frontend (SmartLinkPreview.tsx legacyMap):
--   sm  → 128px
--   md  → 192px
--   lg  → 256px
--   xl  → 320px
--   auto → NULL (altura automática)
-- Após rodar esta migration, o campo legado pode ser ignorado no código.

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
  AND hero_image_height_px IS NULL;  -- só migra quem ainda não tem o novo valor

-- Após a migration, o campo legado pode ser dropado numa migration futura
-- após confirmar que todos os clientes estão na versão nova.
COMMENT ON COLUMN public.links.hero_image_height IS
  '@deprecated — migrado para hero_image_height_px em 2026-03-22. Remover após ciclo de deploy.';
