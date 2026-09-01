// ---------------------------------------------------------------------------
// FIPE grátis via API parallelum (deividfortuna) — https://deividfortuna.github.io/fipe/
//
// Estratégia HÍBRIDA: o provedor de placa (pago) devolve marca/modelo/ano
// baratos; aqui buscamos o VALOR FIPE de graça, cruzando esses dados com a
// tabela FIPE por correspondência aproximada (fuzzy match).
//
// Cadeia da API (sem token):
//   /cars/brands
//   /cars/brands/{marca}/models
//   /cars/brands/{marca}/models/{modelo}/years
//   /cars/brands/{marca}/models/{modelo}/years/{ano-combustivel}
// ---------------------------------------------------------------------------

import type { FipeEntry } from "@/lib/placa";

const BASE = "https://fipe.parallelum.com.br/api/v2";

type Ref = { code: string; name: string };

// cache em memória do processo (marcas e modelos por marca)
const cacheBrands: Record<string, Ref[]> = {};
const cacheModels: Record<string, Ref[]> = {};

/** "cars" | "motorcycles" | "trucks" a partir do tipo do veículo. */
export function segmentoFipe(tipoVeiculo?: string): "cars" | "motorcycles" | "trucks" {
  const t = normalizar(tipoVeiculo ?? "").join(" ");
  if (/\b(moto|motocicleta|ciclomotor)\b/.test(t)) return "motorcycles";
  if (/\b(caminhao|caminhonete pesada|onibus|micro onibus)\b/.test(t)) return "trucks";
  return "cars";
}

async function getJSON<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

/** Normaliza texto: minúsculo, sem acentos, tokens alfanuméricos. */
function normalizar(s: string): string[] {
  return (s || "")
    .normalize("NFD")
    .replace(/[^\x00-\x7f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Quantos tokens de `alvo` aparecem em `candidato` (interseção). */
function pontuar(alvo: string[], candidato: string[]): number {
  const set = new Set(candidato);
  return alvo.reduce((acc, t) => acc + (set.has(t) ? 1 : 0), 0);
}

/** Escolhe o melhor Ref por sobreposição de tokens (0 = sem match). */
function melhor(refs: Ref[], termo: string): Ref | null {
  const alvo = normalizar(termo);
  if (!alvo.length) return null;
  let top: Ref | null = null;
  let topScore = 0;
  for (const r of refs) {
    const s = pontuar(alvo, normalizar(r.name));
    if (s > topScore) {
      topScore = s;
      top = r;
    }
  }
  return topScore > 0 ? top : null;
}

/** Ordena modelos por match e devolve os melhores (com score > 0). */
function melhoresModelos(refs: Ref[], termo: string, limite: number): Ref[] {
  const alvo = normalizar(termo);
  return refs
    .map((r) => ({ r, s: pontuar(alvo, normalizar(r.name)) }))
    .filter((x) => x.s > 0)
    // mais tokens em comum primeiro; empate -> nome mais curto (mais específico)
    .sort((a, b) => b.s - a.s || a.r.name.length - b.r.name.length)
    .slice(0, limite)
    .map((x) => x.r);
}

/**
 * Busca valores FIPE cruzando marca/modelo/ano com a tabela.
 * Retorna [] se não encontrar (o chamador mantém o que já tinha).
 */
export async function buscarFipe(params: {
  marca?: string;
  modelo?: string;
  ano?: string;
  tipoVeiculo?: string;
}): Promise<FipeEntry[]> {
  const { marca, modelo, ano } = params;
  if (!marca || !modelo) return [];

  const seg = segmentoFipe(params.tipoVeiculo);

  // 1) marcas (cache)
  let brands = cacheBrands[seg];
  if (!brands) {
    brands = (await getJSON<Ref[]>(`${BASE}/${seg}/brands`)) ?? [];
    if (brands.length) cacheBrands[seg] = brands;
  }
  const brand = melhor(brands, marca);
  if (!brand) return [];

  // 2) modelos (cache por marca)
  const chaveModelos = `${seg}:${brand.code}`;
  let models = cacheModels[chaveModelos];
  if (!models) {
    models = (await getJSON<Ref[]>(`${BASE}/${seg}/brands/${brand.code}/models`)) ?? [];
    if (models.length) cacheModels[chaveModelos] = models;
  }
  const candidatos = melhoresModelos(models, modelo, 2);
  if (!candidatos.length) return [];

  const anoAlvo = (ano ?? "").match(/\d{4}/)?.[0];
  const entradas: FipeEntry[] = [];

  // 3) anos + 4) valor — limitado para não estourar chamadas
  for (const m of candidatos) {
    const years =
      (await getJSON<Ref[]>(`${BASE}/${seg}/brands/${brand.code}/models/${m.code}/years`)) ?? [];
    // anos que batem com o ano-modelo (ou todos, se ano desconhecido)
    const alvos = years.filter((y) =>
      anoAlvo ? y.code.startsWith(anoAlvo) || y.name.startsWith(anoAlvo) : true,
    );
    // sem ano conhecido, pega só o mais recente para não fazer N chamadas
    const usar = anoAlvo ? alvos : alvos.slice(0, 1);

    for (const y of usar.slice(0, 3)) {
      const v = await getJSON<{
        price?: string;
        model?: string;
        modelYear?: number;
        fuel?: string;
        codeFipe?: string;
        referenceMonth?: string;
      }>(`${BASE}/${seg}/brands/${brand.code}/models/${m.code}/years/${y.code}`);
      if (v?.price) {
        entradas.push({
          codigo: v.codeFipe,
          descricao: v.model ?? m.name,
          valor: v.price,
          anoModelo: v.modelYear ? String(v.modelYear) : anoAlvo,
          combustivel: v.fuel,
          // score = qualidade do match do modelo (para ordenação no front)
          score: pontuar(normalizar(modelo), normalizar(m.name)) * 10,
        });
      }
      if (entradas.length >= 4) break;
    }
    if (entradas.length >= 4) break;
  }

  // melhor match primeiro
  return entradas.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
