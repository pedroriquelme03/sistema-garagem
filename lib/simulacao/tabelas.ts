import { gravarStorage, lerStorage } from "@/lib/armazenamento";
import { tabelasPadrao } from "./price";
import type { BancoTabela } from "./types";

const chave = "garagem-pro-tabelas-bancos";

export function carregarTabelasBancos(): BancoTabela[] {
  const lido = lerStorage<BancoTabela[] | null>(chave, null);
  if (Array.isArray(lido) && lido.length) return lido;
  return tabelasPadrao.map(item => ({ ...item }));
}

export function salvarTabelasBancos(tabelas: BancoTabela[]) {
  gravarStorage(chave, tabelas);
}
