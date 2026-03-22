-- Activate all existing links that were saved as inactive by mistake
UPDATE public.links SET is_active = true WHERE is_active = false;