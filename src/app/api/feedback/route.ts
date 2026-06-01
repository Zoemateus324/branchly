import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Não autorizado", { status: 401 });

    const body = await request.json();
    const { estabelecimentoId, nomeCliente, nota, comentario } = body;

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from("feedbacks_negativos")
      .insert([{ estabelecimento_id: estabelecimentoId, nome_cliente: nomeCliente, nota, comentario }])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}