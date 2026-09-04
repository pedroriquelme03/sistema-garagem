import { parseBRL } from "@/lib/anuncios";
import { planoValido, recursosDoPlano, type PlanoLoja, type RecursoPlano } from "@/lib/acesso/tipos";
import { resolverTema, type TemaLoja } from "@/lib/temas-loja";
import type { LojaVitrine } from "@/lib/vitrine";

export const LOJA_PADRAO = {
  nome: "Garagem",
  whatsapp: "",
  logoSrc: "",
  temaId: "garagem",
  endereco: "Av. República Argentina, 1122 — Centro, Foz do Iguaçu/PR",
  cidade: "Foz do Iguaçu/PR",
  instagram: "",
  facebook: "",
};

export type LojaPublica = LojaVitrine & {
  endereco: string;
  cidade: string;
  instagram: string;
  facebook: string;
  tema: TemaLoja;
  plano: PlanoLoja;
  recursos: RecursoPlano[];
};

export type OrigemEstoque = "vitrine" | "demo";

export function linkWhatsapp(telefone: string, texto: string) {
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return "";
  const comPais = numero.startsWith("55") ? numero : `55${numero}`;
  return `https://wa.me/${comPais}?text=${encodeURIComponent(texto)}`;
}

export function consultaDoMapa(loja: Pick<LojaPublica, "nome" | "endereco" | "cidade">) {
  if (loja.endereco) return loja.endereco;
  return [loja.cidade, loja.nome].filter(Boolean).join(", ");
}

export function linkGoogleMaps(consulta: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
}

export function embedGoogleMaps(consulta: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(consulta)}&z=16&output=embed`;
}

export function resolverLoja(loja: LojaVitrine): LojaPublica {
  const plano: PlanoLoja = planoValido(loja.plano) ? loja.plano : "essencial";
  const recursos = recursosDoPlano(plano);
  const temaLivre = recursos.includes("vitrine-plus") || recursos.includes("site-master");
  const temaId = temaLivre ? (loja.temaId || LOJA_PADRAO.temaId) : "garagem";
  return {
    nome: loja.nome.trim() || LOJA_PADRAO.nome,
    whatsapp: loja.whatsapp.trim(),
    logoSrc: loja.logoSrc,
    temaId,
    plano,
    lojaId: loja.lojaId,
    recursos,
    endereco: (loja.endereco ?? "").trim() || LOJA_PADRAO.endereco,
    cidade: LOJA_PADRAO.cidade,
    instagram: LOJA_PADRAO.instagram,
    facebook: LOJA_PADRAO.facebook,
    tema: resolverTema(temaId),
  };
}

export function precoNumero(valor?: string): number | undefined {
  return parseBRL(valor);
}

export function kmNumero(km?: string): number | undefined {
  if (!km) return undefined;
  const n = Number(String(km).replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function formatarKm(km?: string): string {
  const n = kmNumero(km);
  if (n === undefined) return "Km sob consulta";
  return `${n.toLocaleString("pt-BR")} km`;
}
