import { LOJA_PADRAO } from "@/lib/loja-publico";
import { gravarStorage, lerStorage } from "@/lib/armazenamento";

export type DadosLoja = {
  nome: string;
  site: string;
  whatsapp: string;
  logo: string;
  temaId: string;
  endereco: string;
};

const chave = "garagem-pro-loja";
const vazio: DadosLoja = { nome: "", site: "", whatsapp: "", logo: "", temaId: "garagem", endereco: LOJA_PADRAO.endereco };

export function carregarDadosLoja(): DadosLoja {
  const dados = { ...vazio, ...lerStorage<Partial<DadosLoja>>(chave, {}) };
  if (!dados.endereco?.trim()) dados.endereco = LOJA_PADRAO.endereco;
  return dados;
}

export function salvarDadosLoja(dados: DadosLoja) {
  gravarStorage(chave, dados);
}
