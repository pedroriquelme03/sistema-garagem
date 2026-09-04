import type { PortalId } from "@/lib/integracoes";

export type Papel = "plataforma" | "admin" | "vendedor";
export type StatusLoja = "trial" | "ativa" | "atrasada" | "cancelada";
export type PlanoLoja = "essencial" | "pro" | "master";
export type RecursoPlano =
  | "placa"
  | "fipe"
  | "vitrine"
  | "vitrine-plus"
  | "site-master"
  | "simulacao"
  | "fandi"
  | "bv";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
  lojaId: string | null;
  criadoEm: string;
};

export type Loja = {
  id: string;
  nome: string;
  status: StatusLoja;
  plano: PlanoLoja;
  criadoEm: string;
  modulosLiberados: PortalId[];
};

export type DefinicaoPlano = {
  id: PlanoLoja;
  label: string;
  resumo: string;
  precoMensal: number;
  recursos: RecursoPlano[];
};

export type BancoAcesso = {
  usuarios: Usuario[];
  lojas: Loja[];
  planos: DefinicaoPlano[];
};

export type SessaoCookie = {
  uid: string;
  papel: Papel;
  lojaId: string | null;
  comoLoja: boolean;
  exp: number;
};

export type UsuarioPublico = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  lojaId: string | null;
};

export type LojaPublica = {
  id: string;
  nome: string;
  status: StatusLoja;
  plano: PlanoLoja;
  planoLabel: string;
  planoPreco: number;
  criadoEm: string;
  modulosLiberados: PortalId[];
  recursos: RecursoPlano[];
  usuarios: number;
};

export type SessaoAtual = {
  usuario: UsuarioPublico;
  loja: LojaPublica | null;
  impersonando: boolean;
};

export const COOKIE_SESSAO = "gp_sessao";
export const STATUS_LOJA: { id: StatusLoja; label: string }[] = [
  { id: "trial", label: "Trial" },
  { id: "ativa", label: "Ativa" },
  { id: "atrasada", label: "Atrasada" },
  { id: "cancelada", label: "Cancelada" },
];

export const RECURSOS_PLANO: { id: RecursoPlano; label: string; detalhe: string }[] = [
  { id: "placa", label: "Consulta de placa", detalhe: "Marca, modelo, ano e dados públicos do veículo." },
  { id: "fipe", label: "Placa + FIPE", detalhe: "Valor de tabela e comparação com anúncios." },
  { id: "vitrine", label: "Vitrine simples", detalhe: "Site com o estoque da loja, sem home elaborada." },
  { id: "vitrine-plus", label: "Site completo", detalhe: "Home com destaque, marcas e temas." },
  { id: "site-master", label: "Site sob medida", detalhe: "Identidade 100% da loja." },
  { id: "simulacao", label: "Simulação Price", detalhe: "Parcelas estimadas dentro do sistema." },
  { id: "fandi", label: "FANDI", detalhe: "Simulação FANDI dentro do sistema." },
  { id: "bv", label: "Banco BV", detalhe: "Simulação Banco BV dentro do sistema." },
];

export const PLANOS_PADRAO: DefinicaoPlano[] = [
  {
    id: "essencial",
    label: "Essencial",
    resumo: "Pátio, consulta de placa sem FIPE, simulação Price e vitrine simples.",
    precoMensal: 349.9,
    recursos: ["placa", "vitrine", "simulacao"],
  },
  {
    id: "pro",
    label: "Pro",
    resumo: "Essencial + FIPE no sistema e site da loja mais completo.",
    precoMensal: 499.9,
    recursos: ["placa", "fipe", "vitrine", "vitrine-plus", "simulacao"],
  },
  {
    id: "master",
    label: "Master",
    resumo: "Tudo do Pro + site sob medida, FANDI e Banco BV.",
    precoMensal: 699.9,
    recursos: ["placa", "fipe", "vitrine", "vitrine-plus", "site-master", "simulacao", "fandi", "bv"],
  },
];

export const PLANOS_LOJA = PLANOS_PADRAO;

export function planoValido(valor: unknown): valor is PlanoLoja {
  return valor === "essencial" || valor === "pro" || valor === "master";
}

export function recursoValido(valor: unknown): valor is RecursoPlano {
  return RECURSOS_PLANO.some(item => item.id === valor);
}

export function labelDoPlano(plano: PlanoLoja, catalogo: DefinicaoPlano[] = PLANOS_PADRAO) {
  return catalogo.find(item => item.id === plano)?.label ?? "Essencial";
}

export function precoDoPlano(plano: PlanoLoja, catalogo: DefinicaoPlano[] = PLANOS_PADRAO) {
  return catalogo.find(item => item.id === plano)?.precoMensal ?? PLANOS_PADRAO.find(item => item.id === plano)?.precoMensal ?? 349.9;
}

export function formatarPrecoPlano(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function recursosDoPlano(plano: PlanoLoja, catalogo: DefinicaoPlano[] = PLANOS_PADRAO): RecursoPlano[] {
  const achado = catalogo.find(item => item.id === plano);
  const lista = achado?.recursos?.length ? achado.recursos : PLANOS_PADRAO.find(item => item.id === plano)?.recursos ?? ["placa", "vitrine", "simulacao"];
  return lista.filter(recursoValido);
}

export function temRecurso(
  loja: { recursos?: RecursoPlano[]; plano?: PlanoLoja } | null | undefined,
  recurso: RecursoPlano,
  catalogo: DefinicaoPlano[] = PLANOS_PADRAO,
) {
  if (!loja) return false;
  const lista = loja.recursos?.length ? loja.recursos : recursosDoPlano(loja.plano ?? "essencial", catalogo);
  return lista.includes(recurso);
}
