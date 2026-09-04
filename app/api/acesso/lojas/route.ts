import { NextResponse } from "next/server";
import { criarLoja, listarLojas, usuarioPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ehPlataforma(sessao: Awaited<ReturnType<typeof sessaoDoRequest>>) {
  if (!sessao || sessao.papel !== "plataforma") return false;
  const usuario = usuarioPorId(sessao.uid);
  return usuario?.papel === "plataforma";
}

export async function GET(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!ehPlataforma(sessao)) {
    return NextResponse.json({ erro: "Só a plataforma vê as lojas." }, { status: 403 });
  }
  return NextResponse.json({ lojas: listarLojas() });
}

export async function POST(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!ehPlataforma(sessao)) {
    return NextResponse.json({ erro: "Só a plataforma cria loja." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as {
    nome?: string;
    adminNome?: string;
    adminEmail?: string;
    adminSenha?: string;
    plano?: string;
  } | null;
  try {
    const loja = criarLoja({
      nome: String(corpo?.nome ?? ""),
      adminNome: String(corpo?.adminNome ?? ""),
      adminEmail: String(corpo?.adminEmail ?? ""),
      adminSenha: String(corpo?.adminSenha ?? ""),
      plano: corpo?.plano as "essencial" | "pro" | "master" | undefined,
    });
    return NextResponse.json({ loja });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível criar a loja." }, { status: 400 });
  }
}
