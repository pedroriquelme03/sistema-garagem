import { parseBRL } from "@/lib/anuncios";
import { resolverTema, type TemaLoja } from "@/lib/temas-loja";
import type { LojaVitrine } from "@/lib/vitrine";

export const LOJA_PADRAO = {
  nome: "Garagem",
  whatsapp: "",
  logoSrc: "",
  temaId: "garagem",
  endereco: "",
  cidade: "",
  instagram: "",
  facebook: "",
};

export type LojaPublica = LojaVitrine & {
  endereco: string;
  cidade: string;
  instagram: string;
  facebook: string;
  tema: TemaLoja;
};

export type OrigemEstoque = "vitrine" | "demo";

export function linkWhatsapp(telefone: string, texto: string) {
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return "";
  const comPais = numero.startsWith("55") ? numero : `55${numero}`;
  return `https://wa.me/${comPais}?text=${encodeURIComponent(texto)}`;
}

export function resolverLoja(loja: LojaVitrine): LojaPublica {
  const temaId = loja.temaId || LOJA_PADRAO.temaId;
  return {
    nome: loja.nome.trim() || LOJA_PADRAO.nome,
    whatsapp: loja.whatsapp.trim(),
    logoSrc: loja.logoSrc,
    temaId,
    endereco: LOJA_PADRAO.endereco,
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
