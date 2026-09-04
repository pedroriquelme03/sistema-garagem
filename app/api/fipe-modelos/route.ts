import { NextRequest, NextResponse } from "next/server";
import { lojaPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";
import { temRecurso } from "@/lib/acesso/tipos";

export const dynamic = "force-dynamic";
const BASE = "https://fipe.parallelum.com.br/api/v2/cars";
type Ref = { code: string; name: string };
const cache: Record<string, Record<string, string[]>> = {};

function tokens(value: string) { return value.normalize("NFD").replace(/[^\x00-\x7f]/g, "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); }
function score(a: string, b: string) { const set = new Set(tokens(b)); return tokens(a).reduce((total, token) => total + Number(set.has(token)), 0); }
function familia(nome: string) {
  const parts = nome.trim().split(/\s+/);
  // Casos frequentes em que o nome comercial começa por duas palavras.
  if (["classe", "grand", "new", "nova"].includes(parts[0]?.toLowerCase()) && parts[1]) return `${parts[0]} ${parts[1]}`;
  return parts[0] ?? nome;
}

export async function GET(req: NextRequest) {
  const sessao = await sessaoDoRequest(req);
  const loja = sessao?.lojaId ? lojaPorId(sessao.lojaId) : null;
  if (!temRecurso(loja, "fipe")) {
    return NextResponse.json({ ok: false, error: "Catálogo FIPE entra no plano Pro." }, { status: 403 });
  }
  const marca = req.nextUrl.searchParams.get("marca")?.trim();
  const ano = req.nextUrl.searchParams.get("ano")?.match(/\d{4}/)?.[0];
  if (!marca) return NextResponse.json({ ok: false, error: "Informe a marca." }, { status: 400 });
  try {
    const cacheKey = `${marca}:${ano ?? "todos"}`;
    if (!cache[cacheKey]) {
      const brands = await fetch(`${BASE}/brands`, { cache: "no-store" }).then(r => r.ok ? r.json() : [] as Ref[]) as Ref[];
      const brand = brands.map(item => ({ item, score: score(marca, item.name) })).sort((a, b) => b.score - a.score)[0]?.item;
      if (!brand) return NextResponse.json({ ok: false, error: "Marca não encontrada na FIPE." }, { status: 404 });
      // A FIPE usa códigos de ano com combustível (ex.: 2019-1). Para um
      // ano-modelo, unimos somente as listas daqueles códigos de ano.
      let models: Ref[];
      if (ano) {
        const years = await fetch(`${BASE}/brands/${brand.code}/years`, { cache: "no-store" }).then(r => r.ok ? r.json() : [] as Ref[]) as Ref[];
        const yearsDoModelo = years.filter(year => year.code.startsWith(ano) || year.name.startsWith(ano));
        const listas = await Promise.all(yearsDoModelo.map(year => fetch(`${BASE}/brands/${brand.code}/years/${year.code}/models`, { cache: "no-store" }).then(r => r.ok ? r.json() : [] as Ref[])));
        const unicos = new Map<string, Ref>();
        listas.flat().forEach(model => unicos.set(model.code, model));
        models = [...unicos.values()];
      } else {
        models = await fetch(`${BASE}/brands/${brand.code}/models`, { cache: "no-store" }).then(r => r.ok ? r.json() : [] as Ref[]) as Ref[];
      }
      cache[cacheKey] = models.reduce<Record<string, string[]>>((groups, model) => {
        const key = familia(model.name);
        (groups[key] ??= []).push(model.name);
        return groups;
      }, {});
      Object.values(cache[cacheKey]).forEach(list => list.sort((a, b) => a.localeCompare(b, "pt-BR")));
    }
    const modelos = Object.keys(cache[cacheKey]).sort((a, b) => a.localeCompare(b, "pt-BR"));
    return NextResponse.json({ ok: true, modelos, versoesPorModelo: cache[cacheKey] });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível carregar modelos da FIPE." }, { status: 502 });
  }
}
