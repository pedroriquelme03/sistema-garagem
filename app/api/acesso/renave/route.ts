import { NextResponse } from "next/server";
import { definirPrecoCreditoRenave, recarregarCreditosRenave, usuarioPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ehPlataforma(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!sessao || sessao.papel !== "plataforma") return false;
  return usuarioPorId(sessao.uid)?.papel === "plataforma";
}

export async function POST(request: Request) {
  if (!(await ehPlataforma(request))) {
    return NextResponse.json({ erro: "Só a plataforma lança créditos." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as { lojaId?: string; quantidade?: number } | null;
  try {
    const resultado = recarregarCreditosRenave(String(corpo?.lojaId ?? ""), Number(corpo?.quantidade));
    return NextResponse.json(resultado);
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível lançar os créditos." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await ehPlataforma(request))) {
    return NextResponse.json({ erro: "Só a plataforma altera o preço." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as { preco?: number } | null;
  try {
    const preco = definirPrecoCreditoRenave(Number(corpo?.preco));
    return NextResponse.json({ precoCreditoRenave: preco });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível salvar o preço." }, { status: 400 });
  }
}
