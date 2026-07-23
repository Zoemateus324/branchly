-- =============== meta_connections ===============
-- Stores one Facebook Page connection per owner (v1: single page per
-- account — see comment in src/lib/meta.server.ts for the multi-page
-- rationale). Page access tokens for Facebook Pages do not expire under
-- normal use (they're long-lived once exchanged), but we still track
-- fetched_at so a future refresh job can re-validate them.
CREATE TABLE public.meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  page_id TEXT NOT NULL,
  page_name TEXT,
  page_access_token TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, page_id)
);
GRANT ALL ON public.meta_connections TO service_role;
ALTER TABLE public.meta_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.meta_connections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_meta_connections_owner ON public.meta_connections(owner_id);
CREATE TRIGGER trg_meta_connections_updated_at BEFORE UPDATE ON public.meta_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
