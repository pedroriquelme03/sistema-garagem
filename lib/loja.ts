export type DadosLoja = {
  nome: string;
  site: string;
  whatsapp: string;
  logo: string;
  temaId: string;
};

const chave = "garagem-pro-loja";
const vazio: DadosLoja = { nome: "", site: "", whatsapp: "", logo: "", temaId: "garagem" };

export function carregarDadosLoja(): DadosLoja {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? { ...vazio, ...JSON.parse(salvo) } : vazio;
  } catch {
    return vazio;
  }
}

export function salvarDadosLoja(dados: DadosLoja) {
  localStorage.setItem(chave, JSON.stringify(dados));
}
