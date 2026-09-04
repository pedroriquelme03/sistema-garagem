"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { carregarDadosLoja, salvarDadosLoja, type DadosLoja } from "@/lib/loja";
import { LOJA_PADRAO } from "@/lib/loja-publico";
import { TEMAS_LOJA } from "@/lib/temas-loja";
import { carregarTabelasBancos, salvarTabelasBancos } from "@/lib/simulacao/tabelas";
import { publicarDadosDaLoja } from "@/lib/vitrine-client";
import type { BancoTabela } from "@/lib/simulacao/types";
import { useAcesso } from "@/components/AcessoProvider";
import { CadeadoUpgrade } from "@/components/FaixaUpgrade";
import { temRecurso, type UsuarioPublico } from "@/lib/acesso/tipos";

const vazio: DadosLoja = { nome: "", site: "", whatsapp: "", logo: "", temaId: "garagem", endereco: LOJA_PADRAO.endereco };

export default function Configuracoes() {
  const { sessao } = useAcesso();
  const temaLivre = temRecurso(sessao?.loja, "vitrine-plus") || temRecurso(sessao?.loja, "site-master");
  const siteMaster = temRecurso(sessao?.loja, "site-master");
  const [dados, setDados] = useState<DadosLoja>(vazio);
  const [tabelas, setTabelas] = useState<BancoTabela[]>([]);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setDados(carregarDadosLoja());
    setTabelas(carregarTabelasBancos());
  }, []);

  function set(campo: keyof DadosLoja, valor: string) { setSalvo(false); setDados(old => ({ ...old, [campo]: valor })); }

  function escolherLogo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => set("logo", String(leitor.result ?? ""));
    leitor.readAsDataURL(arquivo);
    event.target.value = "";
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    salvarDadosLoja(dados);
    salvarTabelasBancos(tabelas);
    try {
      await publicarDadosDaLoja({ nome: dados.nome, whatsapp: dados.whatsapp, logo: dados.logo, temaId: temaLivre ? dados.temaId : "garagem", endereco: dados.endereco });
      setSalvo(true);
    } catch {
      setSalvo(true);
    }
  }

  function setTabela(id: string, patch: Partial<BancoTabela>) {
    setSalvo(false);
    setTabelas(old => old.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function addTabela() {
    setSalvo(false);
    setTabelas(old => [...old, { id: crypto.randomUUID(), nome: `Tabela ${old.length + 1}`, taxaMensalPct: 1.99, retornoPct: 2, ativo: true }]);
  }

  function removerTabela(id: string) {
    setSalvo(false);
    setTabelas(old => old.filter(item => item.id !== id));
  }

  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <p className="text-sm font-medium text-brand-600">Configurações</p>
    <h1 className="mt-1 text-3xl font-bold text-slate-950">Dados da loja</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Nome, WhatsApp, endereço e logo também alimentam o site da loja. <a href="/loja" target="_blank" className="font-semibold text-brand-600">Abrir vitrine →</a></p>
    <form onSubmit={salvar} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Nome da loja<input value={dados.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex.: Indy Carros" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>
        <label className="text-xs font-semibold text-slate-600">Site<input value={dados.site} onChange={e => set("site", e.target.value)} placeholder="https://indycarros.com.br" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>
        <label className="text-xs font-semibold text-slate-600">WhatsApp<input value={dados.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="55 41 9XXXX-XXXX" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>
        <label className="text-xs font-semibold text-slate-600 sm:col-span-2">Endereço da loja
          <input value={dados.endereco} onChange={e => set("endereco", e.target.value)} placeholder={LOJA_PADRAO.endereco} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/>
          <span className="mt-1 block font-normal text-slate-400">Aparece no mapa do rodapé da loja. Exemplo: Ozy Veículos. Troque pelo pátio da sua operação.</span>
        </label>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-600">Logo da loja</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="grid h-20 w-32 place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">{dados.logo ? <img src={dados.logo} alt="Logo da loja" className="h-full w-full object-contain"/> : <span className="text-[11px] text-slate-400">Sem logo</span>}</div>
          <label className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><input type="file" accept="image/*" className="sr-only" onChange={escolherLogo}/>Escolher imagem</label>
          {dados.logo && <button type="button" onClick={() => set("logo", "")} className="text-xs font-semibold text-red-600">Remover</button>}
        </div>
      </div>
      {temaLivre ? (
      <div>
        <p className="text-xs font-semibold text-slate-600">Visual do site da loja</p>
        <p className="mt-1 text-sm text-slate-500">{siteMaster ? "Master inclui identidade sob medida. Enquanto o visual customizado da loja não estiver pronto, escolha um tema base." : "Ozy, Indy Car e a próxima loja usam o mesmo sistema — cada uma escolhe uma identidade. Não precisa redesenhar o site."}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMAS_LOJA.map(tema => {
            const ativo = dados.temaId === tema.id;
            return (
              <button
                key={tema.id}
                type="button"
                onClick={() => set("temaId", tema.id)}
                className={`rounded-xl border p-3 text-left ${ativo ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-slate-300"}`}
              >
                <span className="flex h-12 overflow-hidden rounded-lg">
                  <span className="w-1/3" style={{ background: `rgb(${tema.night})` }} />
                  <span className="w-1/3" style={{ background: `rgb(${tema.cobalt})` }} />
                  <span className="w-1/3" style={{ background: `rgb(${tema.paper})` }} />
                </span>
                <span className="mt-2 block text-sm font-semibold text-slate-900">{tema.nome}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{tema.resumo} · header {tema.header}</span>
              </button>
            );
          })}
        </div>
      </div>
      ) : (
      <CadeadoUpgrade
        recurso="vitrine-plus"
        titulo="Temas e home completa"
        texto="No Essencial o site usa o visual padrão. No Pro a loja escolhe a identidade e a home ganha destaque e marcas."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {TEMAS_LOJA.slice(0, 3).map(tema => (
            <div key={tema.id} className="rounded-xl border border-slate-200 p-2">
              <span className="flex h-10 overflow-hidden rounded-lg">
                <span className="w-1/3" style={{ background: `rgb(${tema.night})` }} />
                <span className="w-1/3" style={{ background: `rgb(${tema.cobalt})` }} />
                <span className="w-1/3" style={{ background: `rgb(${tema.paper})` }} />
              </span>
            </div>
          ))}
        </div>
      </CadeadoUpgrade>
      )}
      {!siteMaster ? (
        <CadeadoUpgrade
          recurso="site-master"
          titulo="Site 100% da loja"
          texto="Showroom cinematográfico, ficha do carro e identidade da loja. Desbloqueia no Master, junto com FANDI e Banco BV."
        />
      ) : null}
      <div className="border-t border-slate-100 pt-6">
        <h2 className="text-sm font-semibold text-slate-900">Tabelas de financiamento</h2>
        <p className="mt-1 text-sm text-slate-500">Taxas combinadas no papel com cada banco. Usadas só como estimativa Price — não consultam crédito de verdade.</p>
        <div className="mt-4 space-y-3">
          {tabelas.map(tabela => (
            <div key={tabela.id} className="grid gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-[1fr_7rem_7rem_auto_auto] sm:items-end">
              <label className="text-xs font-semibold text-slate-600">Nome<input value={tabela.nome} onChange={e => setTabela(tabela.id, { nome: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" /></label>
              <label className="text-xs font-semibold text-slate-600">Taxa % a.m.<input type="number" step="0.01" min="0" value={tabela.taxaMensalPct} onChange={e => setTabela(tabela.id, { taxaMensalPct: Number(e.target.value) || 0 })} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" /></label>
              <label className="text-xs font-semibold text-slate-600">Retorno %<input type="number" step="0.1" min="0" value={tabela.retornoPct} onChange={e => setTabela(tabela.id, { retornoPct: Number(e.target.value) || 0 })} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" /></label>
              <label className="flex items-center gap-2 pb-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={tabela.ativo} onChange={e => setTabela(tabela.id, { ativo: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-brand-600" />Ativa</label>
              <button type="button" onClick={() => removerTabela(tabela.id)} className="pb-2 text-xs font-semibold text-red-600">Remover</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addTabela} className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700">+ Adicionar tabela</button>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Salvar</button>
        {salvo && <p className="text-sm text-emerald-700">Dados salvos neste navegador.</p>}
      </div>
    </form>
    <EquipeLoja />
  </div>;
}

function EquipeLoja() {
  const { sessao } = useAcesso();
  const lojaId = sessao?.loja?.id;
  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", papel: "vendedor" as "admin" | "vendedor" });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!lojaId) return;
    fetch(`/api/acesso/lojas/${lojaId}/usuarios`)
      .then(r => r.json())
      .then(d => setUsuarios(d.usuarios ?? []));
  }, [lojaId]);

  async function criar(event: FormEvent) {
    event.preventDefault();
    if (!lojaId) return;
    setErro("");
    const resposta = await fetch(`/api/acesso/lojas/${lojaId}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não criou o usuário.");
      return;
    }
    setUsuarios(lista => [...lista, dados.usuario]);
    setForm({ nome: "", email: "", senha: "", papel: "vendedor" });
  }

  if (!lojaId) return null;

  return (
    <section className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Equipe desta loja</h2>
      <p className="text-sm text-slate-500">Admin vê configurações e canais. Vendedor opera estoque, leads e simulação.</p>
      <ul className="space-y-2">
        {usuarios.map(usuario => (
          <li key={usuario.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="font-medium text-slate-800">{usuario.nome}</span>
            <span className="text-xs text-slate-500">{usuario.papel === "admin" ? "Admin" : "Vendedor"} · {usuario.email}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={criar} className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Nome<input value={form.nome} onChange={e => setForm(v => ({ ...v, nome: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
        <label className="text-xs font-semibold text-slate-600">E-mail<input type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
        <label className="text-xs font-semibold text-slate-600">Senha<input type="password" value={form.senha} onChange={e => setForm(v => ({ ...v, senha: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /></label>
        <label className="text-xs font-semibold text-slate-600">Papel
          <select value={form.papel} onChange={e => setForm(v => ({ ...v, papel: e.target.value as "admin" | "vendedor" }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {erro ? <p className="text-sm text-red-600 sm:col-span-2">{erro}</p> : null}
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Adicionar à loja</button>
      </form>
    </section>
  );
}
