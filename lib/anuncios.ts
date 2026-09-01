// ---------------------------------------------------------------------------
// Camada de anúncios de veículos (provider-agnostic), no mesmo padrão de lib/placa.
//
// Não há API pública gratuita e confiável de anúncios (Webmotors, OLX, iCarros,
// Mercado Livre exigem parceria/token). Então:
//   - Com ANUNCIOS_API_URL configurada, o backend consulta o provedor real.
//   - Sem provedor, roda em MODO DEMO gerando anúncios coerentes em torno do
//     valor FIPE, para comparar o preço de mercado.
// ---------------------------------------------------------------------------

export interface Anuncio {
  titulo: string;
  ano?: string;
  km?: number;
  preco: number;        // valor numérico em reais
  cidade?: string;
  uf?: string;
  fonte?: string;       // Webmotors, OLX, iCarros...
  url?: string;
}

export interface AnunciosResult {
  ok: boolean;
  anuncios: Anuncio[];
  media?: number;       // preço médio dos anúncios
  fipe?: number;        // valor FIPE de referência usado na comparação
  origem: "demo" | "provedor";
  provedor?: string;
  error?: string;
}

// --- helpers de moeda ------------------------------------------------------

/** "R$ 58.412,00" | "58412.5" -> 58412 (número) ou undefined. */
export function parseBRL(valor?: string | number | null): number | undefined {
  if (valor === null || valor === undefined) return undefined;
  if (typeof valor === "number") return isFinite(valor) ? valor : undefined;
  const limpo = valor
    .replace(/[^\d,.-]/g, "")   // remove "R$", espaços etc.
    .replace(/\.(?=\d{3}(\D|$))/g, "") // remove separador de milhar
    .replace(",", ".");
  const n = Number(limpo);
  return isFinite(n) && n > 0 ? n : undefined;
}

/** 58412 -> "R$ 58.412". */
export function formatBRL(n?: number): string {
  if (n === undefined || !isFinite(n)) return "—";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

// --- link do anúncio -------------------------------------------------------

const DOMINIOS: Record<string, string> = {
  webmotors: "webmotors.com.br",
  icarros: "icarros.com.br",
  mobiauto: "mobiauto.com.br",
};

/**
 * URL para abrir o anúncio. No modo demo não há anúncio real, então abrimos a
 * BUSCA do modelo no marketplace correspondente (sempre um link válido).
 */
export function linkAnuncio(
  fonte?: string,
  marca?: string,
  modelo?: string,
): string {
  const termo = [marca, modelo].filter(Boolean).join(" ").trim() || "carros usados";
  const enc = encodeURIComponent(termo);
  const slug = termo.toLowerCase().replace(/\s+/g, "-");
  const f = (fonte ?? "").toLowerCase();

  if (f.includes("mercado")) return `https://lista.mercadolivre.com.br/${slug}`;
  if (f.includes("olx"))
    return `https://www.olx.com.br/autos-e-pecas/carros-vans-e-utilitarios?q=${enc}`;

  // demais: busca no domínio do marketplace via Google (sempre válida)
  const dominio = DOMINIOS[f];
  const q = dominio ? `${termo} site:${dominio}` : `${termo} comprar carro`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

// --- MODO DEMO -------------------------------------------------------------

const FONTES = ["Webmotors", "OLX", "iCarros", "Mercado Livre", "Mobiauto"];
const CIDADES: [string, string][] = [
  ["Foz do Iguaçu", "PR"],
  ["Cascavel", "PR"],
  ["Curitiba", "PR"],
  ["Londrina", "PR"],
  ["Maringá", "PR"],
  ["Florianópolis", "SC"],
];

export function gerarAnunciosDemo(params: {
  marca?: string;
  modelo?: string;
  ano?: string;
  fipe?: number;
}): Anuncio[] {
  const base = params.fipe && params.fipe > 0 ? params.fipe : 50000;
  const titulo = [params.marca, params.modelo].filter(Boolean).join(" ") || "Veículo";
  const anoBase = Number(params.ano) || 2020;

  // desvios em torno do FIPE (mistura de ofertas abaixo e acima)
  const ofertas = [
    { desvio: -0.11, km: 62000, dAno: -1 },
    { desvio: -0.04, km: 48000, dAno: 0 },
    { desvio: 0.01, km: 39000, dAno: 0 },
    { desvio: 0.06, km: 25000, dAno: 1 },
    { desvio: 0.13, km: 14000, dAno: 1 },
  ];

  return ofertas.map((o, i) => {
    const [cidade, uf] = CIDADES[i % CIDADES.length];
    const preco = Math.round((base * (1 + o.desvio)) / 100) * 100; // arredonda p/ centena
    const fonte = FONTES[i % FONTES.length];
    return {
      titulo,
      ano: `${anoBase + o.dAno - 1}/${anoBase + o.dAno}`,
      km: o.km,
      preco,
      cidade,
      uf,
      fonte,
      url: linkAnuncio(fonte, params.marca, params.modelo),
    };
  });
}
