import { NextResponse } from "next/server";
import { lojaPorId, usuarioPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!sessao) return NextResponse.json({ sessao: null }, { status: 401 });
  const usuario = usuarioPorId(sessao.uid);
  if (!usuario) return NextResponse.json({ sessao: null }, { status: 401 });
  const loja = sessao.lojaId ? lojaPorId(sessao.lojaId) : null;
  return NextResponse.json({
    sessao: {
      usuario,
      loja,
      impersonando: sessao.comoLoja,
    },
  });
}
