// Publishable project identifiers are public; privileged keys must only be server secrets.
export const SUPABASE_PUBLIC_URL='https://prvcdlpxnmarpshcgyyp.supabase.co';
export const SUPABASE_PUBLIC_KEY='sb_publishable_S1-DS7neDKJOM_cCrC9npA_S2C346Py';
export function supabaseConfig(){return {url:process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL||SUPABASE_PUBLIC_URL,key:process.env.SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||SUPABASE_PUBLIC_KEY};}
export const supabaseEnabled=()=>process.env.BRANCHLY_SUPABASE_ENABLED!=='0';
