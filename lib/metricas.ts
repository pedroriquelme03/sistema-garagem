import { parseBRL } from "@/lib/anuncios";
import { listarClientes } from "@/lib/clientes";
import { carregarDadosLoja } from "@/lib/loja";
import { listarNegociacoes } from "@/lib/negociacoes";
import { diasNoPatio, listarVeiculos, margemVeiculo, noPatio, type Veiculo } from "@/lib/veiculos";

export type ResumoOperacao = {
  saudacao: string;
  nomeLoja: string;
  noPatio: Veiculo[];
  vendidos: Veiculo[];
  valorPatio: number;
  valorCompraPatio: number;
  margemPatio: number | null;
  diasMedioPatio: number | null;
  clientes: number;
  negociacoes: number;
  vendas: number;
  valorVendas: number;
  margemVendas: number | null;
  recentesPatio: Veiculo[];
};

function saudacaoDoDia(agora = new Date()): string {
  const hora = agora.getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function media(valores: number[]): number | null {
  if (!valores.length) return null;
  return valores.reduce((soma, n) => soma + n, 0) / valores.length;
}

export function resumoOperacao(): ResumoOperacao {
  const veiculos = listarVeiculos();
  const negociacoes = listarNegociacoes();
  const patio = veiculos.filter(noPatio);
  const vendidos = veiculos.filter(veiculo => !noPatio(veiculo));
  const valorPatio = patio.reduce((soma, veiculo) => soma + (parseBRL(veiculo.valorVenda) ?? 0), 0);
  const valorCompraPatio = patio.reduce((soma, veiculo) => soma + (parseBRL(veiculo.valorCompra) ?? 0), 0);
  const margensPatio = patio.map(margemVeiculo).filter((n): n is number => n !== null);
  const dias = patio.map(veiculo => diasNoPatio(veiculo)).filter((n): n is number => n !== null);
  const vendas = negociacoes.filter(item => item.tipo === "Venda");
  const valorVendas = vendas.reduce((soma, item) => soma + (parseBRL(item.valor) ?? 0), 0);
  const margensVendidos = vendidos.map(margemVeiculo).filter((n): n is number => n !== null);
  const loja = carregarDadosLoja();

  return {
    saudacao: saudacaoDoDia(),
    nomeLoja: loja.nome.trim(),
    noPatio: patio,
    vendidos,
    valorPatio,
    valorCompraPatio,
    margemPatio: margensPatio.length ? margensPatio.reduce((a, b) => a + b, 0) : null,
    diasMedioPatio: media(dias),
    clientes: listarClientes().length,
    negociacoes: negociacoes.length,
    vendas: vendas.length,
    valorVendas,
    margemVendas: margensVendidos.length ? margensVendidos.reduce((a, b) => a + b, 0) : null,
    recentesPatio: [...patio].sort((a, b) => (b.criadoEm ?? "").localeCompare(a.criadoEm ?? "")).slice(0, 5),
  };
}
