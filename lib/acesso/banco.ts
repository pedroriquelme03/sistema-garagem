import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { PORTAIS, type PortalId } from "@/lib/integracoes";
import { emailOk, hashSenha, senhaBate, senhaOk } from "@/lib/acesso/senha";
import { PLANOS_PADRAO, labelDoPlano, planoValido, precoDoPlano, recursoValido, recursosDoPlano, type BancoAcesso, type DefinicaoPlano, type Loja, type LojaPublica, type Papel, type PlanoLoja, type RecursoPlano, type StatusLoja, type Usuario, type UsuarioPublico } from "@/lib/acesso/tipos";

const arquivo = path.join(process.cwd(), "data", "acesso.json");

function todosPortais(): PortalId[] {
  return PORTAIS.map(item => item.id);
}

function vazio(): BancoAcesso {
  return { usuarios: [], lojas: [], planos: PLANOS_PADRAO.map(item => ({ ...item, recursos: [...item.recursos] })) };
}

function precoMensalValido(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= 0;
}

function catalogoCompleto(salvos?: DefinicaoPlano[]): DefinicaoPlano[] {
  return PLANOS_PADRAO.map(padrao => {
    const salvo = salvos?.find(item => item.id === padrao.id);
    const label = salvo?.label?.trim() || padrao.label;
    const resumo = salvo?.resumo?.trim() || padrao.resumo;
    const precoMensal = precoMensalValido(salvo?.precoMensal) ? salvo.precoMensal : padrao.precoMensal;
    const brutos = (Array.isArray(salvo?.recursos) ? salvo.recursos : [...padrao.recursos]).filter(recursoValido);
    const recursos: RecursoPlano[] = brutos.length ? brutos : [...padrao.recursos];
    return { id: padrao.id, label, resumo, precoMensal, recursos };
  });
}

function ler(): BancoAcesso {
  if (!existsSync(arquivo)) return vazio();
  try {
    const lido = JSON.parse(readFileSync(arquivo, "utf8")) as BancoAcesso;
    return {
      usuarios: Array.isArray(lido.usuarios) ? lido.usuarios : [],
      lojas: Array.isArray(lido.lojas) ? lido.lojas : [],
      planos: catalogoCompleto(lido.planos),
    };
  } catch {
    return vazio();
  }
}

function gravar(banco: BancoAcesso) {
  mkdirSync(path.dirname(arquivo), { recursive: true });
  writeFileSync(arquivo, JSON.stringify(banco, null, 2), "utf8");
}

function publicoUsuario(usuario: Usuario): UsuarioPublico {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel, lojaId: usuario.lojaId };
}

function publicaLoja(loja: Loja, usuarios: Usuario[], planos = ler().planos): LojaPublica {
  const plano = planoValido(loja.plano) ? loja.plano : "essencial";
  return {
    ...loja,
    plano,
    planoLabel: labelDoPlano(plano, planos),
    planoPreco: precoDoPlano(plano, planos),
    recursos: recursosDoPlano(plano, planos),
    modulosLiberados: Array.isArray(loja.modulosLiberados) && loja.modulosLiberados.length ? loja.modulosLiberados : todosPortais(),
    usuarios: usuarios.filter(item => item.lojaId === loja.id).length,
  };
}

function emailLimpo(email: string) {
  return email.trim().toLowerCase();
}

function novoId() {
  return crypto.randomUUID();
}

export function precisaSetup() {
  return ler().usuarios.every(item => item.papel !== "plataforma");
}

export function lojaPorId(id: string) {
  const banco = ler();
  const loja = banco.lojas.find(item => item.id === id);
  return loja ? publicaLoja(loja, banco.usuarios) : null;
}

export function usuarioPorId(id: string) {
  const usuario = ler().usuarios.find(item => item.id === id);
  return usuario ? publicoUsuario(usuario) : null;
}

export function autenticar(email: string, senha: string) {
  const usuario = ler().usuarios.find(item => item.email === emailLimpo(email));
  if (!usuario || !senhaBate(senha, usuario.senhaHash)) return null;
  return usuario;
}

export function criarPlataforma(pessoas: { nome: string; email: string; senha: string }[]) {
  if (!precisaSetup()) throw new Error("A plataforma já tem dono.");
  const validos = pessoas.filter(item => item.nome.trim() && item.email.trim() && item.senha);
  if (validos.length < 1) throw new Error("Informe pelo menos uma pessoa da plataforma.");
  for (const pessoa of validos) {
    if (!emailOk(pessoa.email)) throw new Error(`E-mail inválido: ${pessoa.email}`);
    if (!senhaOk(pessoa.senha)) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
  }
  const emails = validos.map(item => emailLimpo(item.email));
  if (new Set(emails).size !== emails.length) throw new Error("Os e-mails da plataforma precisam ser diferentes.");
  const agora = new Date().toISOString();
  const usuarios: Usuario[] = validos.map(pessoa => ({
    id: novoId(),
    nome: pessoa.nome.trim(),
    email: emailLimpo(pessoa.email),
    senhaHash: hashSenha(pessoa.senha),
    papel: "plataforma",
    lojaId: null,
    criadoEm: agora,
  }));
  gravar({ usuarios, lojas: [], planos: vazio().planos });
  return usuarios.map(publicoUsuario);
}

export function listarLojas(): LojaPublica[] {
  const banco = ler();
  return banco.lojas.map(loja => publicaLoja(loja, banco.usuarios, banco.planos));
}

export function criarLoja(entrada: { nome: string; adminNome: string; adminEmail: string; adminSenha: string; plano?: PlanoLoja }) {
  const nome = entrada.nome.trim();
  if (!nome) throw new Error("Dê um nome à loja.");
  if (!entrada.adminNome.trim()) throw new Error("Informe o admin da loja.");
  if (!emailOk(entrada.adminEmail)) throw new Error("E-mail do admin inválido.");
  if (!senhaOk(entrada.adminSenha)) throw new Error("A senha do admin precisa ter pelo menos 8 caracteres.");
  const plano = planoValido(entrada.plano) ? entrada.plano : "essencial";
  const banco = ler();
  const email = emailLimpo(entrada.adminEmail);
  if (banco.usuarios.some(item => item.email === email)) throw new Error("Este e-mail já está em uso.");
  const agora = new Date().toISOString();
  const loja: Loja = {
    id: novoId(),
    nome,
    status: "trial",
    plano,
    criadoEm: agora,
    modulosLiberados: todosPortais(),
  };
  const admin: Usuario = {
    id: novoId(),
    nome: entrada.adminNome.trim(),
    email,
    senhaHash: hashSenha(entrada.adminSenha),
    papel: "admin",
    lojaId: loja.id,
    criadoEm: agora,
  };
  banco.lojas.push(loja);
  banco.usuarios.push(admin);
  gravar(banco);
  return publicaLoja(loja, banco.usuarios);
}

export function atualizarLoja(id: string, patch: { nome?: string; status?: StatusLoja; plano?: PlanoLoja; modulosLiberados?: PortalId[] }) {
  const banco = ler();
  const loja = banco.lojas.find(item => item.id === id);
  if (!loja) throw new Error("Loja não encontrada.");
  if (patch.nome?.trim()) loja.nome = patch.nome.trim();
  if (patch.status) loja.status = patch.status;
  if (patch.plano) {
    if (!planoValido(patch.plano)) throw new Error("Plano inválido.");
    loja.plano = patch.plano;
  }
  if (patch.modulosLiberados) {
    loja.modulosLiberados = patch.modulosLiberados.filter(idPortal => PORTAIS.some(item => item.id === idPortal));
    if (!loja.modulosLiberados.includes("site")) loja.modulosLiberados.push("site");
  }
  if (!planoValido(loja.plano)) loja.plano = "essencial";
  gravar(banco);
  return publicaLoja(loja, banco.usuarios);
}

export function listarPlanos(): DefinicaoPlano[] {
  return ler().planos;
}

export function salvarPlano(entrada: { id: PlanoLoja; label?: string; resumo?: string; precoMensal?: number; recursos?: RecursoPlano[] }) {
  if (!planoValido(entrada.id)) throw new Error("Plano inválido.");
  const banco = ler();
  const atual = banco.planos.find(item => item.id === entrada.id);
  if (!atual) throw new Error("Plano não encontrado.");
  if (entrada.label !== undefined) {
    const label = entrada.label.trim();
    if (!label) throw new Error("O plano precisa de um nome.");
    atual.label = label;
  }
  if (entrada.resumo !== undefined) atual.resumo = entrada.resumo.trim();
  if (entrada.precoMensal !== undefined) {
    if (!precoMensalValido(entrada.precoMensal)) throw new Error("Informe um preço mensal válido.");
    atual.precoMensal = entrada.precoMensal;
  }
  if (entrada.recursos) {
    const recursos = entrada.recursos.filter(recursoValido);
    atual.recursos = recursos.length ? recursos : [...(PLANOS_PADRAO.find(item => item.id === entrada.id)?.recursos ?? ["placa", "vitrine", "simulacao"])];
  }
  gravar(banco);
  return {
    plano: atual,
    planos: banco.planos,
  };
}

export function usuariosDaLoja(lojaId: string): UsuarioPublico[] {
  return ler()
    .usuarios.filter(item => item.lojaId === lojaId)
    .map(publicoUsuario);
}

export function criarUsuarioLoja(lojaId: string, entrada: { nome: string; email: string; senha: string; papel: Papel }) {
  if (entrada.papel === "plataforma") throw new Error("Usuário da loja não pode ser da plataforma.");
  if (!entrada.nome.trim()) throw new Error("Informe o nome.");
  if (!emailOk(entrada.email)) throw new Error("E-mail inválido.");
  if (!senhaOk(entrada.senha)) throw new Error("A senha precisa ter pelo menos 8 caracteres.");
  const banco = ler();
  if (!banco.lojas.some(item => item.id === lojaId)) throw new Error("Loja não encontrada.");
  const email = emailLimpo(entrada.email);
  if (banco.usuarios.some(item => item.email === email)) throw new Error("Este e-mail já está em uso.");
  const usuario: Usuario = {
    id: novoId(),
    nome: entrada.nome.trim(),
    email,
    senhaHash: hashSenha(entrada.senha),
    papel: entrada.papel,
    lojaId,
    criadoEm: new Date().toISOString(),
  };
  banco.usuarios.push(usuario);
  gravar(banco);
  return publicoUsuario(usuario);
}
