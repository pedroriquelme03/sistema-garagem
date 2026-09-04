import { NextRequest, NextResponse } from "next/server";
import { carregarLojaVitrine, salvarLogoVitrine, salvarLojaVitrine } from "@/lib/vitrine-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { nome?: string; whatsapp?: string; logo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const atual = await carregarLojaVitrine();
  let logoSrc = atual.logoSrc;
  if (body.logo === "") logoSrc = "";
  else if (body.logo?.startsWith("data:image/")) {
    try {
      logoSrc = await salvarLogoVitrine(body.logo);
    } catch {
      return NextResponse.json({ ok: false, error: "Não foi possível gravar o logo." }, { status: 500 });
    }
  }

  const loja = await salvarLojaVitrine({
    nome: body.nome ?? "",
    whatsapp: body.whatsapp ?? "",
    logoSrc,
  });
  return NextResponse.json({ ok: true, loja });
}
