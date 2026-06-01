import { createClient } from "../../../../../utils/supabase/server"; 
import { FilialList } from "@/components/FilialList";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export default async function Page() {
  const { userId } = await auth();
  
  if (!userId) return <div>Você precisa estar logado.</div>;

  const empresaLogadaId = userId; 

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: filiais } = await supabase
    .from('filiais')
    .select('*')
    .eq('empresa_id', empresaLogadaId);

  return <FilialList data={filiais || []} />;
}