import { NextResponse } from "next/server";
import { criarPlataforma, precisaSetup } from "@/lib/acesso/banco";
import { assinarSessao, opcoesCookie } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Pessoa = { nome?: string; email?: string; senha?: string };

export async function POST(request: Request) {
  if (!precisaSetup()) {
    return NextResponse.json({ erro: "A plataforma já tem dono." }, { status: 409 });
  }
  const corpo = await request.json().catch(() => null) as { pessoas?: Pessoa[] } | null;
  try {
    const usuarios = criarPlataforma(
      (corpo?.pessoas ?? []).map(item => ({
        nome: String(item.nome ?? ""),
        email: String(item.email ?? ""),
        senha: String(item.senha ?? ""),
      })),
    );
    const primeiro = usuarios[0];
    const token = await assinarSessao({ uid: primeiro.id, papel: "plataforma", lojaId: null, comoLoja: false });
    const resposta = NextResponse.json({ usuario: primeiro, usuarios });
    resposta.cookies.set(opcoesCookie(token));
    return resposta;
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível criar o acesso." }, { status: 400 });
  }
}
