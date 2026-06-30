export async function getPlanOverride(email: string): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("plan_overrides")
      .select("plan")
      .eq("user_email", email.trim().toLowerCase())
      .maybeSingle();
    return (data?.plan as string | undefined) ?? null;
  } catch {
    return null;
  }
}