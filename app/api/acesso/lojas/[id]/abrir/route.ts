import { NextResponse } from "next/server";
import { lojaPorId } from "@/lib/acesso/banco";
import { assinarSessao, opcoesCookie, sessaoDoRequest } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  const sessao = await sessaoDoRequest(request);
  if (sessao?.papel !== "plataforma") {
    return NextResponse.json({ erro: "Só a plataforma entra na loja assim." }, { status: 403 });
  }
  const loja = lojaPorId(params.id);
  if (!loja) return NextResponse.json({ erro: "Loja não encontrada." }, { status: 404 });
  const token = await assinarSessao({
    uid: sessao.uid,
    papel: "plataforma",
    lojaId: loja.id,
    comoLoja: true,
  });
  const resposta = NextResponse.json({ ok: true, loja });
  resposta.cookies.set(opcoesCookie(token));
  return resposta;
}
