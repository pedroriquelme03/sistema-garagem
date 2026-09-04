import { gravarStorage, lerStorage } from "@/lib/armazenamento";
import type { SimulacaoSalva } from "./types";

const chave = "garagem-pro-simulacoes";

export function listarSimulacoes(): SimulacaoSalva[] {
  return lerStorage<SimulacaoSalva[]>(chave, []);
}

export function salvarSimulacao(simulacao: SimulacaoSalva): SimulacaoSalva[] {
  const todas = [simulacao, ...listarSimulacoes().filter(item => item.id !== simulacao.id)];
  gravarStorage(chave, todas.slice(0, 200));
  return todas;
}

export function listarSimulacoesPorCliente(clienteId: string): SimulacaoSalva[] {
  return listarSimulacoes()
    .filter(item => item.clienteId === clienteId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}
