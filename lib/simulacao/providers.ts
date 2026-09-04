import type { OfertaSimulacao, SimulacaoPedido } from "./types";

export interface SimulacaoProvider {
  id: "mock" | "provedor";
  nome: string;
  simular(pedido: SimulacaoPedido): Promise<OfertaSimulacao[]>;
}

function hashDeterministico(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  return hash;
}

/** Resposta de desenvolvimento. Não consulta banco de verdade. */
export const mockProvider: SimulacaoProvider = {
  id: "mock",
  nome: "Mock (desenvolvimento)",
  async simular(pedido) {
    const valorFinanciado = Math.max(0, pedido.valorBem - pedido.entrada);
    const ofertas: OfertaSimulacao[] = [];
    for (const tabela of pedido.tabelas.filter(item => item.ativo)) {
      const taxaMensal = tabela.taxaMensalPct / 100;
      for (const prazo of pedido.prazos) {
        const chave = `${tabela.id}:${prazo}:${Math.round(valorFinanciado)}`;
        const resto = hashDeterministico(chave) % 10;
        const status: OfertaSimulacao["status"] = resto < 6 ? "pre_aprovado" : resto < 8 ? "condicionado" : "recusado";
        const fator = (1 + taxaMensal) ** prazo;
        const parcela = taxaMensal <= 0 || prazo <= 0
          ? valorFinanciado / Math.max(prazo, 1)
          : valorFinanciado * taxaMensal * fator / (fator - 1);
        ofertas.push({
          bancoId: tabela.id,
          banco: tabela.nome,
          prazo,
          valorFinanciado,
          parcela,
          taxaMensalPct: tabela.taxaMensalPct,
          cetAnualPct: ((1 + taxaMensal) ** 12 - 1) * 100,
          retornoLoja: valorFinanciado * (tabela.retornoPct / 100),
          origem: "mock",
          status,
          aviso: "Provedor mock. Não é consulta real a banco ou bureau.",
        });
      }
    }
    return ofertas;
  },
};

export function provedoresAtivos(): SimulacaoProvider[] {
  return process.env.SIMULACAO_PROVIDER === "mock" ? [mockProvider] : [];
}
