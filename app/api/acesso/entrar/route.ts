import { NextResponse } from "next/server";
import { autenticar, lojaPorId } from "@/lib/acesso/banco";
import { assinarSessao, opcoesCookie } from "@/lib/acesso/sessao";
import { carimbarPlanoVitrine } from "@/lib/vitrine-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const corpo = await request.json().catch(() => null) as { email?: string; senha?: string } | null;
  const usuario = autenticar(String(corpo?.email ?? ""), String(corpo?.senha ?? ""));
  if (!usuario) {
    return NextResponse.json({ erro: "E-mail ou senha não conferem." }, { status: 401 });
  }
  const token = await assinarSessao({
    uid: usuario.id,
    papel: usuario.papel,
    lojaId: usuario.lojaId,
    comoLoja: false,
  });
  if (usuario.lojaId) {
    const loja = lojaPorId(usuario.lojaId);
    if (loja) await carimbarPlanoVitrine({ id: loja.id, plano: loja.plano, nome: loja.nome });
  }
  const resposta = NextResponse.json({
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel, lojaId: usuario.lojaId },
  });
  resposta.cookies.set(opcoesCookie(token));
  return resposta;
}
