-- Migration: Add color_variants JSONB column to products
-- Run this in the Supabase SQL editor

-- Add the new column (stored as JSONB array of {name, name_ar, hex, gallery} objects)
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS color_variants JSONB DEFAULT '[]'::jsonb;

-- Optional: migrate any existing color text data into the new format
-- (Only run this if you want to preserve old single-color data)
-- UPDATE public.products
--     SET color_variants = jsonb_build_array(
--         jsonb_build_object(
--             'name', COALESCE(color, 'Default'),
--             'name_ar', COALESCE(color_ar, ''),
--             'hex', '#888888',
--             'gallery', COALESCE(gallery, '[]'::jsonb)
--         )
--     )
-- WHERE color IS NOT NULL AND color != '' AND (color_variants IS NULL OR color_variants = '[]'::jsonb);
