"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoPortal } from "@/components/integracoes/LogoPortal";
import { PORTAIS, type PortalId } from "@/lib/integracoes";
import { formatarPrecoPlano, PLANOS_PADRAO, RECURSOS_PLANO, STATUS_LOJA, type DefinicaoPlano, type LojaPublica, type PlanoLoja, type StatusLoja, type UsuarioPublico } from "@/lib/acesso/tipos";
import { useAcesso } from "@/components/AcessoProvider";

export default function PlataformaPage() {
  const { sessao } = useAcesso();
  const router = useRouter();
  const [lojas, setLojas] = useState<LojaPublica[]>([]);
  const [aberta, setAberta] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [erro, setErro] = useState("");
  const [nova, setNova] = useState(false);
  const [form, setForm] = useState({ nome: "", adminNome: "", adminEmail: "", adminSenha: "", plano: "essencial" as PlanoLoja });
  const [vendedor, setVendedor] = useState({ nome: "", email: "", senha: "", papel: "vendedor" as "admin" | "vendedor" });
  const [planos, setPlanos] = useState<DefinicaoPlano[]>(PLANOS_PADRAO);

  async function carregar() {
    const [rLojas, rPlanos] = await Promise.all([fetch("/api/acesso/lojas"), fetch("/api/acesso/planos")]);
    const dados = await rLojas.json();
    const cat = await rPlanos.json();
    setLojas(dados.lojas ?? []);
    if (Array.isArray(cat.planos) && cat.planos.length) setPlanos(cat.planos);
  }

  useEffect(() => { void carregar(); }, []);

  useEffect(() => {
    if (!aberta) {
      setUsuarios([]);
      return;
    }
    fetch(`/api/acesso/lojas/${aberta}/usuarios`)
      .then(r => r.json())
      .then(d => setUsuarios(d.usuarios ?? []));
  }, [aberta]);

  const loja = lojas.find(item => item.id === aberta) ?? null;
  const resumo = useMemo(() => ({
    total: lojas.length,
    ativas: lojas.filter(item => item.status === "ativa").length,
    trial: lojas.filter(item => item.status === "trial").length,
    essencial: lojas.filter(item => item.plano === "essencial").length,
    pro: lojas.filter(item => item.plano === "pro").length,
    master: lojas.filter(item => item.plano === "master").length,
  }), [lojas]);

  async function criar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    const resposta = await fetch("/api/acesso/lojas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível criar a loja.");
      return;
    }
    setForm({ nome: "", adminNome: "", adminEmail: "", adminSenha: "", plano: "essencial" });
    setNova(false);
    await carregar();
    setAberta(dados.loja.id);
  }

  async function salvarLoja(patch: Partial<LojaPublica>) {
    if (!loja) return;
    const resposta = await fetch(`/api/acesso/lojas/${loja.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não salvou.");
      return;
    }
    setLojas(lista => lista.map(item => item.id === dados.loja.id ? { ...item, ...dados.loja } : item));
  }

  async function abrirSistema() {
    if (!loja) return;
    const resposta = await fetch(`/api/acesso/lojas/${loja.id}/abrir`, { method: "POST" });
    if (!resposta.ok) return;
    router.replace("/");
    router.refresh();
  }

  async function addUsuario(event: FormEvent) {
    event.preventDefault();
    if (!loja) return;
    setErro("");
    const resposta = await fetch(`/api/acesso/lojas/${loja.id}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendedor),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não criou o usuário.");
      return;
    }
    setUsuarios(lista => [...lista, dados.usuario]);
    setVendedor({ nome: "", email: "", senha: "", papel: "vendedor" });
    await carregar();
  }

  function toggleModulo(id: PortalId) {
    if (!loja || id === "site") return;
    const tem = loja.modulosLiberados.includes(id);
    const modulosLiberados = tem ? loja.modulosLiberados.filter(item => item !== id) : [...loja.modulosLiberados, id];
    void salvarLoja({ modulosLiberados });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-brand-600">Plataforma</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-950">Lojas assinantes</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        {sessao?.usuario.nome ? `Olá, ${sessao.usuario.nome}. ` : null}
        O plano define o produto (placa, FIPE, site, FANDI/BV). Portais de anúncio são por loja, não por plano.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card numero={resumo.total} label="Assinantes" />
        <Card numero={resumo.ativas} label="Ativas" />
        <Card numero={resumo.trial} label="Em trial" />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Card numero={resumo.essencial} label={planos.find(p => p.id === "essencial")?.label ?? "Essencial"} />
        <Card numero={resumo.pro} label={planos.find(p => p.id === "pro")?.label ?? "Pro"} />
        <Card numero={resumo.master} label={planos.find(p => p.id === "master")?.label ?? "Master"} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        <Link href="/plataforma/planos" className="text-sm font-semibold text-brand-700 hover:text-brand-800">Gerir planos →</Link>
        <button type="button" onClick={() => setNova(v => !v)} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
          {nova ? "Cancelar" : "+ Nova loja"}
        </button>
      </div>

      {nova ? (
        <form onSubmit={criar} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <Campo label="Nome da loja" value={form.nome} onChange={nome => setForm(v => ({ ...v, nome }))} />
          <Campo label="Nome do admin" value={form.adminNome} onChange={adminNome => setForm(v => ({ ...v, adminNome }))} />
          <Campo label="E-mail do admin" type="email" value={form.adminEmail} onChange={adminEmail => setForm(v => ({ ...v, adminEmail }))} />
          <Campo label="Senha do admin" type="password" value={form.adminSenha} onChange={adminSenha => setForm(v => ({ ...v, adminSenha }))} />
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-slate-600">Plano</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {planos.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm(v => ({ ...v, plano: item.id }))}
                  className={`rounded-xl border p-3 text-left ${form.plano === item.id ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-brand-700">{formatarPrecoPlano(item.precoMensal)} / mês</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{item.resumo}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Criar loja</button>
          </div>
        </form>
      ) : null}

      {erro ? <p className="mt-4 text-sm text-red-600">{erro}</p> : null}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {lojas.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Nenhuma loja ainda. Crie a primeira — ela entra em trial no plano que vocês escolherem.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {lojas.map(item => (
              <li key={item.id}>
                <button type="button" onClick={() => setAberta(id => id === item.id ? null : item.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50">
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{item.nome}</span>
                    <span className="text-xs text-slate-500">{item.planoLabel || planos.find(p => p.id === item.plano)?.label || item.plano} · {formatarPrecoPlano(item.planoPreco ?? planos.find(p => p.id === item.plano)?.precoMensal ?? 0)} / mês · {STATUS_LOJA.find(s => s.id === item.status)?.label} · {item.usuarios} usuário{item.usuarios === 1 ? "" : "s"}</span>
                  </span>
                  <span className="text-xs font-semibold text-brand-600">{aberta === item.id ? "Fechar" : "Abrir"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {loja ? (
        <section className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">{loja.nome}</h2>
            <button type="button" onClick={abrirSistema} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Abrir sistema da loja</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">
              Status
              <select
                value={loja.status}
                onChange={e => void salvarLoja({ status: e.target.value as StatusLoja })}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {STATUS_LOJA.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Plano desta loja</p>
            <p className="mt-1 text-sm text-slate-500">O que cada plano inclui se edita em <Link href="/plataforma/planos" className="font-semibold text-brand-700">Planos</Link>. Trocar o plano não mexe nos portais.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {planos.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void salvarLoja({ plano: item.id })}
                  className={`rounded-xl border p-3 text-left ${loja.plano === item.id ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-brand-700">{formatarPrecoPlano(item.precoMensal)} / mês</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{item.resumo}</span>
                </button>
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {RECURSOS_PLANO.filter(item => loja.recursos.includes(item.id)).map(item => (
                <li key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{item.label}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Portais desta loja</p>
            <p className="mt-1 text-sm text-slate-500">Independente do plano. A loja ainda liga ou desliga o que usa em Integrações → Canais.</p>
            <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {PORTAIS.map(portal => {
                const on = loja.modulosLiberados.includes(portal.id);
                const fixo = portal.id === "site";
                return (
                  <li key={portal.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <LogoPortal id={portal.id} />
                      {portal.nome}
                    </span>
                    <button
                      type="button"
                      disabled={fixo}
                      onClick={() => toggleModulo(portal.id)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"} ${fixo ? "opacity-70" : ""}`}
                    >
                      {fixo ? "Sempre on" : on ? "Liberado" : "Bloqueado"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Equipe da loja</p>
            <ul className="mt-3 space-y-2">
              {usuarios.map(usuario => (
                <li key={usuario.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="font-medium text-slate-800">{usuario.nome}</span>
                  <span className="text-xs text-slate-500">{usuario.papel === "admin" ? "Admin" : "Vendedor"} · {usuario.email}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={addUsuario} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Campo label="Nome" value={vendedor.nome} onChange={nome => setVendedor(v => ({ ...v, nome }))} />
              <Campo label="E-mail" type="email" value={vendedor.email} onChange={email => setVendedor(v => ({ ...v, email }))} />
              <Campo label="Senha" type="password" value={vendedor.senha} onChange={senha => setVendedor(v => ({ ...v, senha }))} />
              <label className="text-xs font-semibold text-slate-600">
                Papel
                <select value={vendedor.papel} onChange={e => setVendedor(v => ({ ...v, papel: e.target.value as "admin" | "vendedor" }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <button className="self-end rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Adicionar</button>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Card({ numero, label }: { numero: number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold text-slate-950">{numero}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Campo({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
    </label>
  );
}
