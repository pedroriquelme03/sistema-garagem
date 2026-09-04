export type FormaPagamento = "Pix" | "Cartão" | "Financiamento" | "Dinheiro" | "Transferência";
export type ItemPagamento = { id: string; forma: FormaPagamento; valor: string; banco?: string };
export type NegociacaoTipo = "Venda" | "Compra" | "Consignação" | "Troca";

export type Negociacao = {
  id: string;
  tipo: NegociacaoTipo;
  veiculoId: string;
  clienteId: string;
  responsavelLoja: string;
  valor: string;
  pagamentos: ItemPagamento[];
  criadoEm: string;
  // Preenchidos na negociação de Venda quando o cliente dá um carro na troca.
  trocaVeiculoId?: string;
  trocaNegociacaoId?: string;
  // Preenchido na negociação tipo "Troca" gerada automaticamente, aponta pra Venda de origem.
  negociacaoOrigemId?: string;
};

const chave = "garagem-pro-negociacoes";
const tiposDeEntrada: NegociacaoTipo[] = ["Compra", "Troca", "Consignação"];

export function listarNegociacoes(): Negociacao[] {
  try { return JSON.parse(localStorage.getItem(chave) ?? "[]"); } catch { return []; }
}

export function salvarNegociacao(negociacao: Negociacao): Negociacao[] {
  const todas = listarNegociacoes();
  const existe = todas.some(item => item.id === negociacao.id);
  const atualizadas = existe ? todas.map(item => item.id === negociacao.id ? negociacao : item) : [negociacao, ...todas];
  localStorage.setItem(chave, JSON.stringify(atualizadas));
  return atualizadas;
}

export function buscarNegociacaoPorId(id: string): Negociacao | undefined {
  return listarNegociacoes().find(item => item.id === id);
}

export function listarNegociacoesPorVeiculo(veiculoId: string): Negociacao[] {
  return listarNegociacoes()
    .filter(item => item.veiculoId === veiculoId)
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
}

export function entradaDoVeiculo(veiculoId: string): Negociacao | undefined {
  return listarNegociacoesPorVeiculo(veiculoId).find(item => tiposDeEntrada.includes(item.tipo));
}

export function saidasDoVeiculo(veiculoId: string): Negociacao[] {
  return listarNegociacoesPorVeiculo(veiculoId).filter(item => item.tipo === "Venda");
}

export function listarNegociacoesPorCliente(clienteId: string): Negociacao[] {
  return listarNegociacoes()
    .filter(item => item.clienteId === clienteId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
