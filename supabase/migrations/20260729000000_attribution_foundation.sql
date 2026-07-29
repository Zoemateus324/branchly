-- ============================================================
-- Attribution Foundation — Sprint 1
-- Tables: pixel_sites, sessions, events
-- RPC:    upsert_pixel_session (atomic, conflict-safe)
-- ============================================================

-- pixel_sites: one per tracked website / landing page
CREATE TABLE public.pixel_sites (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  domain     TEXT    NOT NULL,
  pixel_id   TEXT    NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.pixel_sites TO service_role;
ALTER TABLE public.pixel_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.pixel_sites
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_pixel_sites_owner    ON public.pixel_sites(owner_id);
CREATE INDEX idx_pixel_sites_pixel_id ON public.pixel_sites(pixel_id);
CREATE TRIGGER trg_pixel_sites_updated_at
  BEFORE UPDATE ON public.pixel_sites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- sessions: one row per visitor session (30-min inactivity window)
CREATE TABLE public.sessions (
  id               TEXT    PRIMARY KEY,
  site_id          UUID    NOT NULL REFERENCES public.pixel_sites(id) ON DELETE CASCADE,
  owner_id         TEXT    NOT NULL,
  visitor_id       TEXT    NOT NULL,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  utm_content      TEXT,
  utm_term         TEXT,
  referrer         TEXT,
  landing_page     TEXT,
  device_type      TEXT,
  browser          TEXT,
  max_scroll_depth INTEGER,
  duration_seconds INTEGER,
  converted        BOOLEAN     NOT NULL DEFAULT false,
  first_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_sessions_site         ON public.sessions(site_id, last_seen_at DESC);
CREATE INDEX idx_sessions_owner        ON public.sessions(owner_id, last_seen_at DESC);
CREATE INDEX idx_sessions_visitor      ON public.sessions(visitor_id);
CREATE INDEX idx_sessions_utm_campaign ON public.sessions(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- events: raw event stream
CREATE TABLE public.events (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id      UUID    NOT NULL REFERENCES public.pixel_sites(id) ON DELETE CASCADE,
  owner_id     TEXT    NOT NULL,
  session_id   TEXT    NOT NULL,
  visitor_id   TEXT    NOT NULL,
  event_type   TEXT    NOT NULL,
  page_url     TEXT,
  page_title   TEXT,
  referrer     TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  utm_term     TEXT,
  device_type  TEXT,
  browser      TEXT,
  scroll_depth INTEGER,
  properties   JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX idx_events_site_created ON public.events(site_id, created_at DESC);
CREATE INDEX idx_events_session      ON public.events(session_id, created_at DESC);
CREATE INDEX idx_events_type_created ON public.events(event_type, created_at DESC);
CREATE INDEX idx_events_campaign     ON public.events(utm_campaign, created_at DESC) WHERE utm_campaign IS NOT NULL;
CREATE INDEX idx_events_owner        ON public.events(owner_id, created_at DESC);

-- Atomic session upsert: safe for concurrent pixel events
CREATE OR REPLACE FUNCTION public.upsert_pixel_session(
  p_id           TEXT,
  p_site_id      UUID,
  p_owner_id     TEXT,
  p_visitor_id   TEXT,
  p_utm_source   TEXT,
  p_utm_medium   TEXT,
  p_utm_campaign TEXT,
  p_utm_content  TEXT,
  p_utm_term     TEXT,
  p_referrer     TEXT,
  p_landing_page TEXT,
  p_device_type  TEXT,
  p_browser      TEXT,
  p_scroll_depth INTEGER DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sessions (
    id, site_id, owner_id, visitor_id,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term,
    referrer, landing_page, device_type, browser
  ) VALUES (
    p_id, p_site_id, p_owner_id, p_visitor_id,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_utm_term,
    p_referrer, p_landing_page, p_device_type, p_browser
  )
  ON CONFLICT (id) DO UPDATE SET
    last_seen_at     = now(),
    max_scroll_depth = CASE
      WHEN p_scroll_depth IS NOT NULL
        THEN GREATEST(COALESCE(sessions.max_scroll_depth, 0), p_scroll_depth)
      ELSE sessions.max_scroll_depth
    END;
END;
$$;
GRANT EXECUTE ON FUNCTION public.upsert_pixel_session TO service_role;
