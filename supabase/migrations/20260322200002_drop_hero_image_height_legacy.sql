-- Remove campo legado hero_image_height após migração de dados (20260322200001)
-- Todos os valores foram convertidos para hero_image_height_px (INTEGER).

ALTER TABLE public.links DROP COLUMN IF EXISTS hero_image_height;
