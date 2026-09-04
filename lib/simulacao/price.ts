import type { BancoTabela, OfertaSimulacao, SimulacaoPedido } from "./types";

/** Parcela da Tabela Price: PMT = PV * i * (1+i)^n / ((1+i)^n - 1). */
export function parcelaPrice(valorFinanciado: number, taxaMensal: number, prazo: number): number {
  if (valorFinanciado <= 0 || prazo <= 0) return 0;
  if (taxaMensal <= 0) return valorFinanciado / prazo;
  const fator = (1 + taxaMensal) ** prazo;
  return valorFinanciado * taxaMensal * fator / (fator - 1);
}

/** CET anual aproximado só com juros da tabela — sem IOF nem tarifas. */
export function cetAnualAprox(taxaMensal: number): number {
  if (taxaMensal <= 0) return 0;
  return (1 + taxaMensal) ** 12 - 1;
}

export function estimarOfertas(pedido: SimulacaoPedido): OfertaSimulacao[] {
  const valorFinanciado = Math.max(0, pedido.valorBem - pedido.entrada);
  const tabelas = pedido.tabelas.filter(tabela => tabela.ativo);
  const ofertas: OfertaSimulacao[] = [];

  for (const tabela of tabelas) {
    const taxaMensal = tabela.taxaMensalPct / 100;
    for (const prazo of pedido.prazos) {
      const parcela = parcelaPrice(valorFinanciado, taxaMensal, prazo);
      ofertas.push({
        bancoId: tabela.id,
        banco: tabela.nome,
        prazo,
        valorFinanciado,
        parcela,
        taxaMensalPct: tabela.taxaMensalPct,
        cetAnualPct: cetAnualAprox(taxaMensal) * 100,
        retornoLoja: valorFinanciado * (tabela.retornoPct / 100),
        origem: "estimativa",
        status: "estimativa",
        aviso: "Estimativa da tabela da loja. Não é aprovação de crédito.",
      });
    }
  }

  return ofertas.sort((a, b) => a.parcela - b.parcela || a.prazo - b.prazo);
}

export const tabelasPadrao: BancoTabela[] = [
  { id: "banco-1", nome: "Banco 1", taxaMensalPct: 1.79, retornoPct: 2, ativo: true },
  { id: "banco-2", nome: "Banco 2", taxaMensalPct: 1.99, retornoPct: 2.5, ativo: true },
  { id: "financeira-1", nome: "Financeira 1", taxaMensalPct: 2.39, retornoPct: 3.5, ativo: true },
];
