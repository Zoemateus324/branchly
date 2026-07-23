-- Instagram Business accounts are always linked through a connected
-- Facebook Page (there is no standalone "Login with Instagram" for
-- business data access) — so we extend the existing meta_connections
-- row instead of creating a parallel table.
ALTER TABLE public.meta_connections
  ADD COLUMN instagram_business_account_id TEXT,
  ADD COLUMN instagram_username TEXT;
