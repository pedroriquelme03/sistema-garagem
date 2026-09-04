import { NextRequest, NextResponse } from "next/server";
import { provedoresAtivos } from "@/lib/simulacao/providers";
import type { BancoTabela, SimulacaoPedido } from "@/lib/simulacao/types";

export const dynamic = "force-dynamic";

function numero(valor: unknown): number | null {
  const n = typeof valor === "number" ? valor : Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido." }, { status: 400 });
  }

  const valorBem = numero(body.valorBem);
  const entrada = numero(body.entrada) ?? 0;
  const prazos = Array.isArray(body.prazos)
    ? body.prazos.map(numero).filter((n): n is number => n !== null && n >= 1 && n <= 84)
    : [];
  const tabelas = Array.isArray(body.tabelas) ? body.tabelas as BancoTabela[] : [];

  if (valorBem === null || valorBem <= 0) {
    return NextResponse.json({ ok: false, error: "Informe o valor do veículo." }, { status: 400 });
  }
  if (entrada >= valorBem) {
    return NextResponse.json({ ok: false, error: "A entrada precisa ser menor que o valor do veículo." }, { status: 400 });
  }
  if (!prazos.length) {
    return NextResponse.json({ ok: false, error: "Escolha ao menos um prazo." }, { status: 400 });
  }

  const pedido: SimulacaoPedido = {
    valorBem,
    entrada,
    prazos,
    clienteId: typeof body.clienteId === "string" ? body.clienteId : undefined,
    veiculoId: typeof body.veiculoId === "string" ? body.veiculoId : undefined,
    renda: numero(body.renda) ?? undefined,
    tabelas: tabelas.filter(item => item && item.ativo !== false && item.nome && Number(item.taxaMensalPct) >= 0),
  };

  const provedores = provedoresAtivos();
  if (!provedores.length) {
    return NextResponse.json({
      ok: true,
      origem: "nenhum",
      ofertas: [],
      aviso: "Nenhum hub/banco conectado. As parcelas na tela são estimativa da tabela da loja.",
    });
  }

  try {
    const ofertas = (await Promise.all(provedores.map(provedor => provedor.simular(pedido)))).flat();
    return NextResponse.json({
      ok: true,
      origem: provedores[0].id,
      ofertas,
      aviso: provedores[0].id === "mock"
        ? "Provedor mock ativo (SIMULACAO_PROVIDER=mock). Não consulta banco real."
        : undefined,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: `Falha no provedor de simulação: ${(e as Error).message}`,
    }, { status: 502 });
  }
}
