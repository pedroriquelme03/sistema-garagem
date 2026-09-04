import { NextRequest, NextResponse } from "next/server";
import { lojaPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";
import { temRecurso } from "@/lib/acesso/tipos";
import { carregarLojaVitrine, salvarLogoVitrine, salvarLojaVitrine } from "@/lib/vitrine-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { nome?: string; whatsapp?: string; logo?: string; temaId?: string; endereco?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const atual = await carregarLojaVitrine();
  const sessao = await sessaoDoRequest(req);
  const conta = sessao?.lojaId ? lojaPorId(sessao.lojaId) : null;
  const temaLivre = temRecurso(conta, "vitrine-plus") || temRecurso(conta, "site-master");
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
    temaId: temaLivre ? (body.temaId || atual.temaId || "garagem") : "garagem",
    endereco: body.endereco ?? atual.endereco ?? "",
    plano: conta?.plano ?? atual.plano,
    lojaId: conta?.id ?? atual.lojaId,
  });
  return NextResponse.json({ ok: true, loja });
}
