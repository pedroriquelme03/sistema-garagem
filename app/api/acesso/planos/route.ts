import { NextResponse } from "next/server";
import { listarPlanos, salvarPlano, usuarioPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";
import { planoValido, recursoValido, type PlanoLoja, type RecursoPlano } from "@/lib/acesso/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ehPlataforma(sessao: Awaited<ReturnType<typeof sessaoDoRequest>>) {
  if (!sessao || sessao.papel !== "plataforma") return false;
  return usuarioPorId(sessao.uid)?.papel === "plataforma";
}

export async function GET(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!ehPlataforma(sessao)) {
    return NextResponse.json({ erro: "Só a plataforma vê os planos." }, { status: 403 });
  }
  return NextResponse.json({ planos: listarPlanos() });
}

export async function PATCH(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!ehPlataforma(sessao)) {
    return NextResponse.json({ erro: "Só a plataforma altera os planos." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as {
    id?: PlanoLoja;
    label?: string;
    resumo?: string;
    precoMensal?: number;
    recursos?: RecursoPlano[];
  } | null;
  if (!corpo || !planoValido(corpo.id)) {
    return NextResponse.json({ erro: "Informe o plano." }, { status: 400 });
  }
  try {
    const resultado = salvarPlano({
      id: corpo.id,
      label: corpo.label,
      resumo: corpo.resumo,
      precoMensal: typeof corpo.precoMensal === "number" ? corpo.precoMensal : undefined,
      recursos: Array.isArray(corpo.recursos) ? corpo.recursos.filter(recursoValido) : undefined,
    });
    return NextResponse.json(resultado);
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível salvar o plano." }, { status: 400 });
  }
}
