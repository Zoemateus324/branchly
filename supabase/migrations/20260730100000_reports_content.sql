-- Add content_json to reports for storing KPI snapshots
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS content_json JSONB;
