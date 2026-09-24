import { NextResponse } from "next/server";
import { lojaPorId, movimentosRenaveDaLoja, registrarRenave } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!sessao?.lojaId) {
    return NextResponse.json({ erro: "Abra uma loja para ver o RENAVE." }, { status: 403 });
  }
  const loja = lojaPorId(sessao.lojaId);
  if (!loja) return NextResponse.json({ erro: "Loja não encontrada." }, { status: 404 });
  return NextResponse.json({
    saldo: loja.creditosRenave,
    automatico: loja.renaveAutomatico === true,
    movimentos: movimentosRenaveDaLoja(loja.id),
  });
}

export async function POST(request: Request) {
  const sessao = await sessaoDoRequest(request);
  if (!sessao?.lojaId) {
    return NextResponse.json({ erro: "Abra uma loja para registrar o RENAVE." }, { status: 403 });
  }
  const corpo = await request.json().catch(() => null) as { evento?: string; placa?: string } | null;
  const evento = corpo?.evento === "saida" ? "saida" : corpo?.evento === "entrada" ? "entrada" : null;
  if (!evento) return NextResponse.json({ erro: "Informe entrada ou saída." }, { status: 400 });
  try {
    const resultado = registrarRenave(sessao.lojaId, String(corpo?.placa ?? ""), evento);
    return NextResponse.json({ ...resultado, movimentos: movimentosRenaveDaLoja(sessao.lojaId) });
  } catch (erro) {
    return NextResponse.json({ erro: erro instanceof Error ? erro.message : "Não foi possível registrar o RENAVE." }, { status: 400 });
  }
}
