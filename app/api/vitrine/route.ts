import { NextRequest, NextResponse } from "next/server";
import { lojaPorId } from "@/lib/acesso/banco";
import { sessaoDoRequest } from "@/lib/acesso/sessao";
import { carimbarPlanoVitrine, publicarNaVitrine, buscarNaVitrine, salvarArquivosDeFoto } from "@/lib/vitrine-store";
import type { VeiculoVitrine } from "@/lib/vitrine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Envie os dados do veículo e as fotos." }, { status: 400 });
  }

  const bruto = form.get("veiculo");
  if (typeof bruto !== "string") {
    return NextResponse.json({ ok: false, error: "Faltou o cadastro do veículo." }, { status: 400 });
  }

  let dados: Partial<VeiculoVitrine>;
  try {
    dados = JSON.parse(bruto);
  } catch {
    return NextResponse.json({ ok: false, error: "Cadastro do veículo inválido." }, { status: 400 });
  }

  const id = String(dados.id ?? "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Veículo sem identificador." }, { status: 400 });

  const arquivos = form.getAll("fotos").filter((item): item is File => item instanceof File && item.size > 0).slice(0, 12);
  const existente = await buscarNaVitrine(id);
  const fotos = arquivos.length
    ? await salvarArquivosDeFoto(id, await Promise.all(arquivos.map(async arquivo => ({
      id: (arquivo.name.replace(/\.[^.]+$/, "") || crypto.randomUUID()).slice(0, 80),
      buffer: Buffer.from(await arquivo.arrayBuffer()),
      tipo: arquivo.type,
      nome: arquivo.name,
    }))))
    : (existente?.fotos ?? []);

  const veiculo: VeiculoVitrine = {
    id,
    marca: dados.marca,
    modelo: dados.modelo,
    versao: dados.versao,
    anoFabricacao: dados.anoFabricacao,
    anoModelo: dados.anoModelo,
    cor: dados.cor,
    combustivel: dados.combustivel,
    cambio: dados.cambio,
    km: dados.km,
    portas: dados.portas,
    carroceria: dados.carroceria,
    valorVenda: dados.valorVenda,
    descricao: dados.descricao,
    acessorios: dados.acessorios,
    condicao: dados.condicao,
    tipo: dados.tipo,
    garantia: dados.garantia,
    fotos,
    atualizadoEm: new Date().toISOString(),
  };

  await publicarNaVitrine(veiculo);
  const sessao = await sessaoDoRequest(req);
  const conta = sessao?.lojaId ? lojaPorId(sessao.lojaId) : null;
  if (conta) await carimbarPlanoVitrine({ id: conta.id, plano: conta.plano, nome: conta.nome });
  return NextResponse.json({ ok: true, veiculo });
}
