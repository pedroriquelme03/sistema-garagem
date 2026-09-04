import { parseBRL } from "@/lib/anuncios";

export type Foto = { id?: string; url?: string; nome?: string };
export type Veiculo = {
  id: string;
  placa?: string; chassi?: string; renavam?: string; tipo?: string; condicao?: string;
  marca?: string; modelo?: string; versao?: string; anoFabricacao?: string; anoModelo?: string;
  cor?: string; combustivel?: string; portas?: string; carroceria?: string; cambio?: string; km?: string;
  garantia?: string; tipoEstoque?: string; valorCompra?: string; valorVenda?: string; status?: string;
  descricao?: string; acessorios?: string;
  cabide1?: string; cabide2?: string; cabide3?: string; cabide4?: string; cabide5?: string; cabide6?: string;
  fotos?: Foto[];
  criadoEm?: string;
};

const chave = "garagem-pro-estoque";

export function listarVeiculos(): Veiculo[] {
  try { return JSON.parse(localStorage.getItem(chave) ?? "[]"); } catch { return []; }
}

export function salvarVeiculo(veiculo: Veiculo): Veiculo[] {
  const todos = listarVeiculos();
  const registro = { ...veiculo, criadoEm: veiculo.criadoEm ?? new Date().toISOString() };
  const existe = todos.some(item => item.id === registro.id);
  const atualizados = existe ? todos.map(item => item.id === registro.id ? registro : item) : [registro, ...todos];
  localStorage.setItem(chave, JSON.stringify(atualizados));
  return atualizados;
}

export function excluirVeiculo(id: string): Veiculo[] {
  const atualizados = listarVeiculos().filter(item => item.id !== id);
  localStorage.setItem(chave, JSON.stringify(atualizados));
  return atualizados;
}

export function buscarVeiculoPorId(id: string): Veiculo | undefined {
  return listarVeiculos().find(item => item.id === id);
}

export function nomeVeiculo(veiculo: Pick<Veiculo, "marca" | "modelo">): string {
  return [veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "Veículo";
}

export function noPatio(veiculo: Veiculo): boolean {
  return veiculo.status !== "Vendido";
}

export function diasNoPatio(veiculo: Veiculo, agora = Date.now()): number | null {
  if (!veiculo.criadoEm) return null;
  const inicio = new Date(veiculo.criadoEm).getTime();
  if (!Number.isFinite(inicio)) return null;
  return Math.max(0, Math.floor((agora - inicio) / 86_400_000));
}

export function textoDiasNoPatio(veiculo: Veiculo): string {
  const dias = diasNoPatio(veiculo);
  if (dias === null) return "—";
  if (dias === 0) return "hoje";
  if (dias === 1) return "1 dia";
  return `${dias} dias`;
}

export function margemVeiculo(veiculo: Veiculo): number | null {
  const venda = parseBRL(veiculo.valorVenda);
  const compra = parseBRL(veiculo.valorCompra);
  if (venda === undefined || compra === undefined) return null;
  return venda - compra;
}
