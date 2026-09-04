import { NextResponse } from "next/server";
import { atualizarLoja, lojaPorId, usuariosDaLoja } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";
import { carimbarPlanoVitrine, carregarLojaVitrine } from "@/lib/vitrine-store";
import type { PortalId } from "@/lib/integracoes";
import type { PlanoLoja, StatusLoja } from "@/lib/acesso/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(request: Request, { params }: Params) {
  const sessao = await sessaoDoRequest(request);
  if (sessao?.papel !== "plataforma") {
    return NextResponse.json({ erro: "Só a plataforma vê esta loja." }, { status: 403 });
  }
  const loja = lojaPorId(params.id);
  if (!loja) return NextResponse.json({ erro: "Loja não encontrada." }, { status: 404 });
  return NextResponse.json({ loja, usuarios: usuariosDaLoja(params.id) });
}

export async function PATCH(request: Request, { params }: Params) {
  const sessao = await sessaoDoRequest(request);
  if (sessao?.papel !== "plataforma") {
    return NextResponse.json({ erro: "Só a plataforma altera a loja." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as {
    nome?: string;
    status?: StatusLoja;
    plano?: PlanoLoja;
    modulosLiberados?: PortalId[];
  } | null;
  try {
    const loja = atualizarLoja(params.id, {
      nome: corpo?.nome,
      status: corpo?.status,
      plano: corpo?.plano,
      modulosLiberados: corpo?.modulosLiberados,
    });
    const vitrine = await carregarLojaVitrine();
    if (!vitrine.lojaId || vitrine.lojaId === loja.id) {
      await carimbarPlanoVitrine({ id: loja.id, plano: loja.plano, nome: loja.nome });
    }
    return NextResponse.json({ loja });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível salvar." }, { status: 400 });
  }
}
