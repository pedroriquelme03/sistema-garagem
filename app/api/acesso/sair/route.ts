import { NextResponse } from "next/server";
import { opcoesLimparCookie } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(opcoesLimparCookie());
  return resposta;
}
