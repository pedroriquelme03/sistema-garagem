import { cookies } from "next/headers";
import { listarLojas, listarPlanos, lojaPorId } from "@/lib/acesso/banco";
import { COOKIE_SESSAO, planoValido, type PlanoLoja } from "@/lib/acesso/tipos";
import { lerSessao } from "@/lib/acesso/sessao";
import { ESTOQUE_DEMO } from "@/lib/estoque-demo";
import { resolverLoja, type LojaPublica, type OrigemEstoque } from "@/lib/loja-publico";
import type { VeiculoVitrine } from "@/lib/vitrine";
import { buscarNaVitrine, carimbarPlanoVitrine, carregarLojaVitrine, listarVitrine } from "@/lib/vitrine-store";

function planoDaVitrine(vitrine: { plano?: string; lojaId?: string; nome?: string }): PlanoLoja {
  if (planoValido(vitrine.plano)) return vitrine.plano;
  if (vitrine.lojaId) {
    const loja = lojaPorId(vitrine.lojaId);
    if (loja) return loja.plano;
  }
  const lojas = listarLojas();
  if (lojas.length === 1) return lojas[0].plano;
  const nome = (vitrine.nome ?? "").trim().toLowerCase();
  const porNome = nome ? lojas.find(item => item.nome.trim().toLowerCase() === nome) : undefined;
  return porNome?.plano ?? "essencial";
}

export async function carregarLojaPublica(): Promise<LojaPublica> {
  const vitrine = await carregarLojaVitrine();
  const token = cookies().get(COOKIE_SESSAO)?.value;
  const sessao = await lerSessao(token);
  const daSessao = sessao?.lojaId ? lojaPorId(sessao.lojaId) : null;
  if (daSessao) {
    await carimbarPlanoVitrine({ id: daSessao.id, plano: daSessao.plano, nome: daSessao.nome });
  }
  const plano = daSessao?.plano ?? planoDaVitrine(vitrine);
  return resolverLoja({
    ...vitrine,
    nome: vitrine.nome || daSessao?.nome || "",
    plano,
    lojaId: daSessao?.id ?? vitrine.lojaId,
  }, listarPlanos());
}

export async function listarEstoquePublico(): Promise<{ veiculos: VeiculoVitrine[]; origem: OrigemEstoque }> {
  const veiculos = await listarVitrine();
  if (veiculos.length > 0) return { veiculos, origem: "vitrine" };
  return { veiculos: ESTOQUE_DEMO, origem: "demo" };
}

export async function buscarEstoquePublico(id: string): Promise<{ veiculo: VeiculoVitrine; origem: OrigemEstoque } | null> {
  const publicado = await buscarNaVitrine(id);
  if (publicado) return { veiculo: publicado, origem: "vitrine" };
  const demo = ESTOQUE_DEMO.find(item => item.id === id);
  if (demo) return { veiculo: demo, origem: "demo" };
  return null;
}
