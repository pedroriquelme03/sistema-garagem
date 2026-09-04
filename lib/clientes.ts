import { gravarStorage, lerStorage } from "@/lib/armazenamento";

export type Pessoa = "fisica" | "juridica";
export type ClienteForm = Record<string, string>;
export type Cliente = ClienteForm & { id: string; pessoa: Pessoa };

const chave = "garagem-pro-clientes";

export const clienteInicial: ClienteForm = { nome: "", documento: "", rg: "", sexo: "", nascimento: "", email: "", telefone: "", observacao: "", responsavel: "", cpfResponsavel: "", emailResponsavel: "", telefoneResponsavel: "", inscricaoEstadual: "", inscricaoMunicipal: "", suframa: "", cep: "", endereco: "", numero: "", complemento: "", bairro: "", municipio: "", uf: "", codigoMunicipio: "" };

export const cepFormat = (value: string) => { const digits = value.replace(/\D/g, "").slice(0, 8); return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits; };
export const phoneFormat = (value: string) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
export const docFormat = (value: string, pessoa: Pessoa) => { const d = value.replace(/\D/g, "").slice(0, pessoa === "fisica" ? 11 : 14); return pessoa === "fisica" ? d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2") : d.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2"); };

export function listarClientes(): Cliente[] {
  return lerStorage<Cliente[]>(chave, []);
}

export function salvarCliente(cliente: Cliente): Cliente[] {
  const todos = listarClientes();
  const existe = todos.some(item => item.id === cliente.id);
  const atualizados = existe ? todos.map(item => item.id === cliente.id ? cliente : item) : [cliente, ...todos];
  gravarStorage(chave, atualizados);
  return atualizados;
}

export function excluirCliente(id: string): Cliente[] {
  const atualizados = listarClientes().filter(item => item.id !== id);
  gravarStorage(chave, atualizados);
  return atualizados;
}

export function buscarClientePorId(id: string): Cliente | undefined {
  return listarClientes().find(item => item.id === id);
}

export function filtrarClientes(clientes: Cliente[], termo: string): Cliente[] {
  const busca = termo.toLowerCase();
  return clientes.filter(cliente => [cliente.nome, cliente.documento, cliente.telefone, cliente.municipio].join(" ").toLowerCase().includes(busca));
}
