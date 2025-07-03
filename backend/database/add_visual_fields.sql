-- Database Migration: Add Visual Generation Fields to Policies Table
-- Run this in your Supabase SQL Editor

-- Add visual URL fields to existing policies table
ALTER TABLE policies 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS keypoints_urls TEXT[],
ADD COLUMN IF NOT EXISTS infographic_url TEXT,
ADD COLUMN IF NOT EXISTS visuals_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS visual_generation_status VARCHAR(20) DEFAULT 'pending';

-- Create index for visual generation status for efficient querying
CREATE INDEX IF NOT EXISTS idx_policies_visual_status ON policies(visual_generation_status);
CREATE INDEX IF NOT EXISTS idx_policies_visuals_generated_at ON policies(visuals_generated_at);

-- Create storage bucket for policy visuals if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'policy-visuals',
  'policy-visuals',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY IF NOT EXISTS "Policy visuals are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'policy-visuals');

CREATE POLICY IF NOT EXISTS "Service role can upload policy visuals" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'policy-visuals' AND auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role can update policy visuals" ON storage.objects
FOR UPDATE USING (bucket_id = 'policy-visuals' AND auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Service role can delete policy visuals" ON storage.objects
FOR DELETE USING (bucket_id = 'policy-visuals' AND auth.role() = 'service_role');

-- Create function to update visual generation status
CREATE OR REPLACE FUNCTION update_visual_generation_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.thumbnail_url IS NOT NULL OR NEW.keypoints_urls IS NOT NULL OR NEW.infographic_url IS NOT NULL THEN
    NEW.visual_generation_status = 'completed';
    NEW.visuals_generated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update visual generation status
DROP TRIGGER IF EXISTS trigger_update_visual_status ON policies;
CREATE TRIGGER trigger_update_visual_status
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_visual_generation_status();

-- Create view for policies with visual status
CREATE OR REPLACE VIEW policies_with_visuals AS
SELECT 
  p.*,
  pc.name as category_name,
  pc.slug as category_slug,
  ga.name as agency_name,
  ga.logo_url as agency_logo,
  CASE 
    WHEN p.thumbnail_url IS NOT NULL AND p.keypoints_urls IS NOT NULL AND p.infographic_url IS NOT NULL THEN 'complete'
    WHEN p.thumbnail_url IS NOT NULL OR p.keypoints_urls IS NOT NULL OR p.infographic_url IS NOT NULL THEN 'partial'
    ELSE 'none'
  END as visual_completeness,
  COALESCE(array_length(p.keypoints_urls, 1), 0) as keypoints_count
FROM policies p
LEFT JOIN policy_categories pc ON p.category_id = pc.id
LEFT JOIN government_agencies ga ON p.agency_id = ga.id;

-- Grant necessary permissions
GRANT ALL ON policies_with_visuals TO authenticated;
GRANT ALL ON policies_with_visuals TO service_role;

-- Add helpful comments
COMMENT ON COLUMN policies.thumbnail_url IS 'URL to generated thumbnail image (800x600 PNG)';
COMMENT ON COLUMN policies.keypoints_urls IS 'Array of URLs to key point card images (400x300 PNG each)';
COMMENT ON COLUMN policies.infographic_url IS 'URL to generated infographic image (1200x1600 PNG)';
COMMENT ON COLUMN policies.visuals_generated_at IS 'Timestamp when visuals were last generated';
COMMENT ON COLUMN policies.visual_generation_status IS 'Status: pending, processing, completed, failed';

COMMENT ON VIEW policies_with_visuals IS 'Enhanced view of policies with visual generation status and related data';

-- Verify the migration
SELECT 
  'Migration completed successfully. Visual fields added to policies table.' as status,
  COUNT(*) as total_policies,
  COUNT(thumbnail_url) as policies_with_thumbnails,
  COUNT(keypoints_urls) as policies_with_keypoints,
  COUNT(infographic_url) as policies_with_infographics
FROM policies;