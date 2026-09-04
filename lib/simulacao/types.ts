export const PRAZOS_PADRAO = [12, 24, 36, 48, 60] as const;

export type BancoTabela = {
  id: string;
  nome: string;
  taxaMensalPct: number;
  retornoPct: number;
  ativo: boolean;
};

export type SimulacaoPedido = {
  valorBem: number;
  entrada: number;
  prazos: number[];
  clienteId?: string;
  veiculoId?: string;
  renda?: number;
  tabelas: BancoTabela[];
};

export type OfertaSimulacao = {
  bancoId: string;
  banco: string;
  prazo: number;
  valorFinanciado: number;
  parcela: number;
  taxaMensalPct: number;
  cetAnualPct: number;
  retornoLoja: number;
  origem: "estimativa" | "mock" | "provedor";
  status: "estimativa" | "pre_aprovado" | "recusado" | "condicionado";
  aviso?: string;
};

export type SimulacaoSalva = {
  id: string;
  criadoEm: string;
  clienteId?: string;
  veiculoId?: string;
  valorBem: number;
  entrada: number;
  prazos: number[];
  ofertas: OfertaSimulacao[];
};

export type SimulacaoApiResult = {
  ok: boolean;
  origem: "nenhum" | "mock" | "provedor";
  ofertas: OfertaSimulacao[];
  aviso?: string;
  error?: string;
};
