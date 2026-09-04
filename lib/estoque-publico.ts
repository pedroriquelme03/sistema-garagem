import { ESTOQUE_DEMO } from "@/lib/estoque-demo";
import { resolverLoja, type LojaPublica, type OrigemEstoque } from "@/lib/loja-publico";
import type { VeiculoVitrine } from "@/lib/vitrine";
import { buscarNaVitrine, carregarLojaVitrine, listarVitrine } from "@/lib/vitrine-store";

export async function carregarLojaPublica(): Promise<LojaPublica> {
  return resolverLoja(await carregarLojaVitrine());
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
