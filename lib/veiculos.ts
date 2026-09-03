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
  const existe = todos.some(item => item.id === veiculo.id);
  const atualizados = existe ? todos.map(item => item.id === veiculo.id ? veiculo : item) : [veiculo, ...todos];
  localStorage.setItem(chave, JSON.stringify(atualizados));
  return atualizados;
}

export function buscarVeiculoPorId(id: string): Veiculo | undefined {
  return listarVeiculos().find(item => item.id === id);
}
