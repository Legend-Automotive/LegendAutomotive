-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Note: RLS on storage.objects is enabled by default in Supabase.
-- If you encounter permission errors, ensure the bucket exists and policies are applied.

-- Allow public access to images (SELECT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
        AND schemaname = 'storage'
        AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'vehicle-images' );
    END IF;
END $$;

-- Allow authenticated users to upload images (INSERT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
        AND schemaname = 'storage'
        AND policyname = 'Authenticated Insert'
    ) THEN
        CREATE POLICY "Authenticated Insert"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'vehicle-images' AND
            auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- Allow authenticated users to update their images (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
        AND schemaname = 'storage'
        AND policyname = 'Authenticated Update'
    ) THEN
        CREATE POLICY "Authenticated Update"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'vehicle-images' AND
            auth.role() = 'authenticated'
        );
    END IF;
END $$;

-- Allow authenticated users to delete their images (DELETE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'objects'
        AND schemaname = 'storage'
        AND policyname = 'Authenticated Delete'
    ) THEN
        CREATE POLICY "Authenticated Delete"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'vehicle-images' AND
            auth.role() = 'authenticated'
        );
    END IF;
END $$;
