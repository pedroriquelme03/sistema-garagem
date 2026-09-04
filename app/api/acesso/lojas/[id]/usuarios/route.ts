import { NextResponse } from "next/server";
import { criarUsuarioLoja, usuariosDaLoja } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";
import type { Papel } from "@/lib/acesso/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

function podeGerir(sessao: Awaited<ReturnType<typeof sessaoDoRequest>>, lojaId: string) {
  if (!sessao) return false;
  if (sessao.papel === "plataforma") return true;
  return sessao.papel === "admin" && sessao.lojaId === lojaId;
}

export async function GET(request: Request, { params }: Params) {
  const sessao = await sessaoDoRequest(request);
  if (!podeGerir(sessao, params.id)) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }
  return NextResponse.json({ usuarios: usuariosDaLoja(params.id) });
}

export async function POST(request: Request, { params }: Params) {
  const sessao = await sessaoDoRequest(request);
  if (!podeGerir(sessao, params.id)) {
    return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as {
    nome?: string;
    email?: string;
    senha?: string;
    papel?: Papel;
  } | null;
  const papel = corpo?.papel === "admin" ? "admin" : "vendedor";
  try {
    const usuario = criarUsuarioLoja(params.id, {
      nome: String(corpo?.nome ?? ""),
      email: String(corpo?.email ?? ""),
      senha: String(corpo?.senha ?? ""),
      papel,
    });
    return NextResponse.json({ usuario });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível criar o usuário." }, { status: 400 });
  }
}
