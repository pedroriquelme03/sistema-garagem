import { NextResponse } from "next/server";
import { criarPlataforma, usuarioPlataforma } from "@/lib/acesso/banco";
import { assinarSessao, opcoesCookie } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ erro: "Indisponível." }, { status: 404 });
  }

  let usuario = usuarioPlataforma();
  if (!usuario) {
    const criados = criarPlataforma([
      { nome: "Desenvolvimento", email: "dev@garagem.local", senha: "desenvolvimento" },
    ]);
    usuario = criados[0];
  }

  const token = await assinarSessao({
    uid: usuario.id,
    papel: "plataforma",
    lojaId: null,
    comoLoja: false,
  });
  const resposta = NextResponse.json({ usuario });
  resposta.cookies.set(opcoesCookie(token));
  return resposta;
}
