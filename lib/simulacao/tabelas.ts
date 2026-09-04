import { tabelasPadrao } from "./price";
import type { BancoTabela } from "./types";

const chave = "garagem-pro-tabelas-bancos";

export function carregarTabelasBancos(): BancoTabela[] {
  try {
    const salvo = localStorage.getItem(chave);
    if (!salvo) return tabelasPadrao.map(item => ({ ...item }));
    const lido = JSON.parse(salvo) as BancoTabela[];
    return Array.isArray(lido) && lido.length ? lido : tabelasPadrao.map(item => ({ ...item }));
  } catch {
    return tabelasPadrao.map(item => ({ ...item }));
  }
}

export function salvarTabelasBancos(tabelas: BancoTabela[]) {
  localStorage.setItem(chave, JSON.stringify(tabelas));
}
