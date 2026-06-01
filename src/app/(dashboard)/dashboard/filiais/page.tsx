import { createClient } from "@/utils/supabase/server"; 
import { FilialList } from "@/components/FilialList";
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  
  if (!userId) return <div>Você precisa estar logado.</div>;

  // Variável declarada aqui!
  const empresaLogadaId = userId; 

  const supabase = await createClient();
  
  // Agora o TypeScript sabe quem é empresaLogadaId
  const { data: filiais } = await supabase
    .from('filiais')
    .select('*')
    .eq('empresa_id', empresaLogadaId);

  return <FilialList data={filiais || []} />;
}