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
};

export function nomeVitrine(veiculo: Pick<VeiculoVitrine, "marca" | "modelo">): string {
  return [veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "Veículo";
}

export function anoVitrine(veiculo: Pick<VeiculoVitrine, "anoFabricacao" | "anoModelo">): string {
  return [veiculo.anoFabricacao, veiculo.anoModelo].filter(Boolean).join("/") || "—";
}
