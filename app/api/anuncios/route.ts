import { NextRequest, NextResponse } from "next/server";
import {
  Anuncio,
  AnunciosResult,
  gerarAnunciosDemo,
  parseBRL,
} from "@/lib/anuncios";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Configuração via variáveis de ambiente (.env.local):
//
//   ANUNCIOS_API_URL    Template da URL do provedor de anúncios. Marcadores:
//                       {marca} {modelo} {ano} {token}
//   ANUNCIOS_API_TOKEN  Token/API key do provedor.
//
// Sem ANUNCIOS_API_URL => MODO DEMO (anúncios em torno do valor FIPE).
// ---------------------------------------------------------------------------

function media(anuncios: Anuncio[]): number | undefined {
  if (!anuncios.length) return undefined;
  return Math.round(anuncios.reduce((s, a) => s + a.preco, 0) / anuncios.length);
}

/** Adapta o JSON do provedor para a lista interna de anúncios. */
function normalizarAnuncios(raw: any): Anuncio[] {
  const lista: any[] = Array.isArray(raw)
    ? raw
    : raw?.anuncios ?? raw?.results ?? raw?.data ?? raw?.items ?? [];
  return lista
    .map((it): Anuncio => ({
      titulo: String(it.titulo ?? it.title ?? it.nome ?? "Veículo"),
      ano: it.ano ?? it.year,
      km: it.km !== undefined ? Number(it.km) : undefined,
      preco: parseBRL(it.preco ?? it.price ?? it.valor) ?? 0,
      cidade: it.cidade ?? it.city,
      uf: it.uf ?? it.estado,
      fonte: it.fonte ?? it.source ?? it.origem,
      url: it.url ?? it.link,
    }))
    .filter((a) => a.preco > 0);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const marca = sp.get("marca") ?? undefined;
  const modelo = sp.get("modelo") ?? undefined;
  const ano = sp.get("ano") ?? undefined;
  const fipe = parseBRL(sp.get("fipe"));

  const urlTemplate = process.env.ANUNCIOS_API_URL;
  const token = process.env.ANUNCIOS_API_TOKEN ?? "";

  // Sem provedor -> demo
  if (!urlTemplate) {
    const anuncios = gerarAnunciosDemo({ marca, modelo, ano, fipe });
    const result: AnunciosResult = {
      ok: true,
      anuncios,
      media: media(anuncios),
      fipe,
      origem: "demo",
    };
    return NextResponse.json(result);
  }

  const url = urlTemplate
    .replace(/{marca}/gi, encodeURIComponent(marca ?? ""))
    .replace(/{modelo}/gi, encodeURIComponent(modelo ?? ""))
    .replace(/{ano}/gi, encodeURIComponent(ano ?? ""))
    .replace(/{token}/gi, encodeURIComponent(token));

  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const raw = await resp.json();
    if (!resp.ok || raw?.erro || raw?.error) {
      const msg = raw?.mensagem || raw?.message || raw?.erro || raw?.error || `HTTP ${resp.status}`;
      const result: AnunciosResult = { ok: false, anuncios: [], origem: "provedor", error: String(msg) };
      return NextResponse.json(result, { status: 502 });
    }
    const anuncios = normalizarAnuncios(raw);
    const provedor = (() => { try { return new URL(url).hostname; } catch { return "provedor"; } })();
    const result: AnunciosResult = {
      ok: true,
      anuncios,
      media: media(anuncios),
      fipe,
      origem: "provedor",
      provedor,
    };
    return NextResponse.json(result);
  } catch (e) {
    const result: AnunciosResult = {
      ok: false,
      anuncios: [],
      origem: "provedor",
      error: `Não foi possível contatar o provedor de anúncios: ${(e as Error).message}`,
    };
    return NextResponse.json(result, { status: 502 });
  }
}
