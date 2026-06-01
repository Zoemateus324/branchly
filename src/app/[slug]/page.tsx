export default async function FilialPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  return (
    <div>
      <h1>Detalhes da Filial: {slug}</h1>
      {/* Aqui você faria a busca no Supabase pelo slug */}
    </div>
  );
}