CREATE TABLE public.plan_overrides (
  user_email TEXT PRIMARY KEY,
  plan TEXT NOT NULL,
  reason TEXT,
  set_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.plan_overrides TO service_role;
ALTER TABLE public.plan_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.plan_overrides FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER set_plan_overrides_updated_at BEFORE UPDATE ON public.plan_overrides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.admin_audit_log FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.app_config FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER set_app_config_updated_at BEFORE UPDATE ON public.app_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  user_email TEXT,
  feature TEXT NOT NULL,
  tokens_estimate INTEGER NOT NULL DEFAULT 0,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role only" ON public.ai_usage FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE INDEX ai_usage_created_at_idx ON public.ai_usage (created_at DESC);
CREATE INDEX ai_usage_user_idx ON public.ai_usage (user_id, created_at DESC);