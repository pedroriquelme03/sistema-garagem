import { NextResponse } from "next/server";
import { assinarSessao, opcoesCookie, sessaoDoRequest } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (sessao?.papel !== "plataforma") {
    return NextResponse.json({ erro: "Só a plataforma volta para o painel." }, { status: 403 });
  }
  const token = await assinarSessao({
    uid: sessao.uid,
    papel: "plataforma",
    lojaId: null,
    comoLoja: false,
  });
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(opcoesCookie(token));
  return resposta;
}
