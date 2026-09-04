import type { Veiculo } from "./veiculos";

export function veiculoVaiParaOSite(veiculo: Pick<Veiculo, "status">): boolean {
  return veiculo.status !== "Vendido";
}

export async function publicarVeiculoNoSite(veiculo: Veiculo, fotos: { id: string; file: File }[]) {
  if (!veiculoVaiParaOSite(veiculo)) {
    await fetch(`/api/vitrine/${veiculo.id}`, { method: "DELETE" });
    return;
  }

  const publico = {
    id: veiculo.id,
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    versao: veiculo.versao,
    anoFabricacao: veiculo.anoFabricacao,
    anoModelo: veiculo.anoModelo,
    cor: veiculo.cor,
    combustivel: veiculo.combustivel,
    cambio: veiculo.cambio,
    km: veiculo.km,
    portas: veiculo.portas,
    carroceria: veiculo.carroceria,
    valorVenda: veiculo.valorVenda,
    descricao: veiculo.descricao,
    acessorios: veiculo.acessorios,
    condicao: veiculo.condicao,
    tipo: veiculo.tipo,
    garantia: veiculo.garantia,
  };

  const body = new FormData();
  body.append("veiculo", JSON.stringify(publico));
  fotos.slice(0, 12).forEach(foto => body.append("fotos", foto.file, foto.id));
  const resp = await fetch("/api/vitrine", { method: "POST", body });
  if (!resp.ok) {
    const json = await resp.json().catch(() => ({}));
    throw new Error(json.error ?? "Não foi possível publicar o veículo no site.");
  }
}

export async function tirarVeiculoDoSite(id: string) {
  await fetch(`/api/vitrine/${id}`, { method: "DELETE" });
}

export async function publicarDadosDaLoja(dados: { nome: string; whatsapp: string; logo: string; temaId?: string }) {
  const resp = await fetch("/api/vitrine/loja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resp.ok) {
    const json = await resp.json().catch(() => ({}));
    throw new Error(json.error ?? "Não foi possível atualizar o site da loja.");
  }
}
