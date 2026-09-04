export type FotoVitrine = { id: string; src: string };

export type VeiculoVitrine = {
  id: string;
  marca?: string;
  modelo?: string;
  versao?: string;
  anoFabricacao?: string;
  anoModelo?: string;
  cor?: string;
  combustivel?: string;
  cambio?: string;
  km?: string;
  portas?: string;
  carroceria?: string;
  valorVenda?: string;
  descricao?: string;
  acessorios?: string;
  condicao?: string;
  tipo?: string;
  garantia?: string;
  fotos: FotoVitrine[];
  atualizadoEm: string;
};

export type LojaVitrine = {
  nome: string;
  whatsapp: string;
  logoSrc: string;
  temaId: string;
  endereco?: string;
  plano?: "essencial" | "pro" | "master";
  lojaId?: string;
};

export function nomeVitrine(veiculo: Pick<VeiculoVitrine, "marca" | "modelo" | "versao">): string {
  return [veiculo.marca, veiculo.modelo, veiculo.versao].filter(Boolean).join(" ") || "Veículo";
}

export function tituloCurto(veiculo: Pick<VeiculoVitrine, "marca" | "modelo">): string {
  return [veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "Veículo";
}

export function anoVitrine(veiculo: Pick<VeiculoVitrine, "anoFabricacao" | "anoModelo">): string {
  return [veiculo.anoFabricacao, veiculo.anoModelo].filter(Boolean).join("/") || "—";
}

export function marcaNormalizada(marca?: string): string {
  return (marca ?? "").trim().toUpperCase();
}

export function marcasDoEstoque(veiculos: VeiculoVitrine[]): { marca: string; quantidade: number }[] {
  const mapa = new Map<string, number>();
  for (const veiculo of veiculos) {
    const marca = marcaNormalizada(veiculo.marca);
    if (!marca) continue;
    mapa.set(marca, (mapa.get(marca) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([marca, quantidade]) => ({ marca, quantidade }))
    .sort((a, b) => a.marca.localeCompare(b.marca, "pt-BR"));
}

export function modelosDoEstoque(veiculos: VeiculoVitrine[], marca?: string): { modelo: string; quantidade: number }[] {
  const filtro = marcaNormalizada(marca);
  const mapa = new Map<string, number>();
  for (const veiculo of veiculos) {
    if (filtro && marcaNormalizada(veiculo.marca) !== filtro) continue;
    const modelo = (veiculo.modelo ?? "").trim();
    if (!modelo) continue;
    const chave = modelo.toUpperCase();
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([modelo, quantidade]) => ({ modelo, quantidade }))
    .sort((a, b) => a.modelo.localeCompare(b.modelo, "pt-BR"));
}

export function carroceriasDoEstoque(veiculos: VeiculoVitrine[]): { tipo: string; quantidade: number }[] {
  const mapa = new Map<string, number>();
  for (const veiculo of veiculos) {
    const tipo = (veiculo.carroceria ?? "").trim();
    if (!tipo) continue;
    mapa.set(tipo, (mapa.get(tipo) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([tipo, quantidade]) => ({ tipo, quantidade }))
    .sort((a, b) => a.tipo.localeCompare(b.tipo, "pt-BR"));
}
