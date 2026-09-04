import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { LOJA_PADRAO } from "./loja-publico";
import type { LojaVitrine, VeiculoVitrine } from "./vitrine";

const dataDir = () => path.join(process.cwd(), "data");
const fotosDir = () => path.join(process.cwd(), "public", "vitrine");
const estoquePath = () => path.join(dataDir(), "vitrine.json");
const lojaPath = () => path.join(dataDir(), "loja-vitrine.json");

async function garantirPastas() {
  await mkdir(dataDir(), { recursive: true });
  await mkdir(fotosDir(), { recursive: true });
}

export async function listarVitrine(): Promise<VeiculoVitrine[]> {
  try {
    const bruto = await readFile(estoquePath(), "utf8");
    const lista = JSON.parse(bruto) as VeiculoVitrine[];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export async function buscarNaVitrine(id: string): Promise<VeiculoVitrine | undefined> {
  return (await listarVitrine()).find(item => item.id === id);
}

async function gravarLista(lista: VeiculoVitrine[]) {
  await garantirPastas();
  await writeFile(estoquePath(), JSON.stringify(lista, null, 2), "utf8");
}

export async function publicarNaVitrine(veiculo: VeiculoVitrine): Promise<VeiculoVitrine[]> {
  const lista = await listarVitrine();
  const atualizados = lista.some(item => item.id === veiculo.id)
    ? lista.map(item => item.id === veiculo.id ? veiculo : item)
    : [veiculo, ...lista];
  await gravarLista(atualizados);
  return atualizados;
}

export async function removerDaVitrine(id: string): Promise<void> {
  const lista = (await listarVitrine()).filter(item => item.id !== id);
  await gravarLista(lista);
  await rm(path.join(fotosDir(), id), { recursive: true, force: true });
}

export function extensaoDaFoto(tipo: string, nome = ""): string {
  if (tipo.includes("png") || nome.endsWith(".png")) return "png";
  if (tipo.includes("webp") || nome.endsWith(".webp")) return "webp";
  return "jpg";
}

export async function salvarArquivosDeFoto(
  veiculoId: string,
  arquivos: { id: string; buffer: Buffer; tipo: string; nome: string }[],
): Promise<{ id: string; src: string }[]> {
  const pasta = path.join(fotosDir(), veiculoId);
  await rm(pasta, { recursive: true, force: true });
  await mkdir(pasta, { recursive: true });
  const fotos = [];
  for (const arquivo of arquivos) {
    const id = arquivo.id.replace(/[^a-zA-Z0-9_-]/g, "") || crypto.randomUUID();
    const ext = extensaoDaFoto(arquivo.tipo, arquivo.nome);
    const arquivoNome = `${id}.${ext}`;
    await writeFile(path.join(pasta, arquivoNome), arquivo.buffer);
    fotos.push({ id, src: `/vitrine/${veiculoId}/${arquivoNome}` });
  }
  return fotos;
}

export async function carregarLojaVitrine(): Promise<LojaVitrine> {
  try {
    const bruto = await readFile(lojaPath(), "utf8");
    const salvo = JSON.parse(bruto) as Partial<LojaVitrine>;
    return {
      nome: "",
      whatsapp: "",
      logoSrc: "",
      temaId: "garagem",
      ...salvo,
      endereco: (salvo.endereco ?? "").trim() || LOJA_PADRAO.endereco,
      plano: salvo.plano,
      lojaId: salvo.lojaId,
    };
  } catch {
    return { nome: "", whatsapp: "", logoSrc: "", temaId: "garagem", endereco: LOJA_PADRAO.endereco };
  }
}

export async function salvarLojaVitrine(loja: LojaVitrine): Promise<LojaVitrine> {
  await garantirPastas();
  const registro = {
    nome: loja.nome.trim(),
    whatsapp: loja.whatsapp.trim(),
    logoSrc: loja.logoSrc,
    temaId: loja.temaId || "garagem",
    endereco: (loja.endereco ?? "").trim(),
    plano: loja.plano,
    lojaId: loja.lojaId,
  };
  await writeFile(lojaPath(), JSON.stringify(registro, null, 2), "utf8");
  return registro;
}

export async function carimbarPlanoVitrine(conta: { id: string; plano?: LojaVitrine["plano"]; nome: string }) {
  const atual = await carregarLojaVitrine();
  await salvarLojaVitrine({
    ...atual,
    plano: conta.plano ?? atual.plano,
    lojaId: conta.id,
    nome: atual.nome.trim() || conta.nome,
  });
}

export async function salvarLogoVitrine(dataUrl: string): Promise<string> {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return "";
  const ext = extensaoDaFoto(match[1]);
  await garantirPastas();
  const destino = path.join(fotosDir(), `logo.${ext}`);
  await writeFile(destino, Buffer.from(match[2], "base64"));
  return `/vitrine/logo.${ext}?v=${Date.now()}`;
}
