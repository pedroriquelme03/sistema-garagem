"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Pessoa = { nome: string; email: string; senha: string };

const vazio: Pessoa = { nome: "", email: "", senha: "" };

export default function EntrarPage() {
  const router = useRouter();
  const [setup, setSetup] = useState<boolean | null>(null);
  const [voce, setVoce] = useState<Pessoa>(vazio);
  const [socio, setSocio] = useState<Pessoa>(vazio);
  const [login, setLogin] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch("/api/acesso/estado")
      .then(r => r.json())
      .then(d => setSetup(Boolean(d.precisaSetup)))
      .catch(() => setSetup(false));
  }, []);

  async function criar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    const pessoas = [voce, socio].filter(item => item.nome.trim() || item.email.trim() || item.senha);
    const resposta = await fetch("/api/acesso/primeiro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pessoas }),
    });
    const dados = await resposta.json().catch(() => ({}));
    setEnviando(false);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível criar o acesso.");
      return;
    }
    router.replace("/plataforma");
    router.refresh();
  }

  async function entrar(event: FormEvent) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    const resposta = await fetch("/api/acesso/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login),
    });
    const dados = await resposta.json().catch(() => ({}));
    setEnviando(false);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível entrar.");
      return;
    }
    const papel = dados.usuario?.papel;
    router.replace(papel === "plataforma" ? "/plataforma" : "/");
    router.refresh();
  }

  if (setup === null) {
    return <div className="grid min-h-dvh place-items-center text-sm text-slate-500">Carregando…</div>;
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-100 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">Garagem Pro</p>
        <h1 className="mt-2 text-2xl font-bold text-white">{setup ? "Acesso da plataforma" : "Entrar"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {setup
            ? "Você e o sócio entram aqui. Depois cada loja ganha o próprio admin e os vendedores."
            : "Use o e-mail da plataforma, do admin da loja ou do vendedor."}
        </p>

        {setup ? (
          <form onSubmit={criar} className="mt-8 space-y-6">
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Você</legend>
              <Campo label="Nome" value={voce.nome} onChange={nome => setVoce(v => ({ ...v, nome }))} />
              <Campo label="E-mail" type="email" value={voce.email} onChange={email => setVoce(v => ({ ...v, email }))} />
              <Campo label="Senha (mín. 8)" type="password" value={voce.senha} onChange={senha => setVoce(v => ({ ...v, senha }))} />
            </fieldset>
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sócio (opcional)</legend>
              <Campo label="Nome" value={socio.nome} onChange={nome => setSocio(v => ({ ...v, nome }))} />
              <Campo label="E-mail" type="email" value={socio.email} onChange={email => setSocio(v => ({ ...v, email }))} />
              <Campo label="Senha" type="password" value={socio.senha} onChange={senha => setSocio(v => ({ ...v, senha }))} />
            </fieldset>
            {erro ? <p className="text-sm text-red-400">{erro}</p> : null}
            <button disabled={enviando} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {enviando ? "Criando…" : "Criar plataforma"}
            </button>
          </form>
        ) : (
          <form onSubmit={entrar} className="mt-8 space-y-3">
            <Campo label="E-mail" type="email" value={login.email} onChange={email => setLogin(v => ({ ...v, email }))} />
            <Campo label="Senha" type="password" value={login.senha} onChange={senha => setLogin(v => ({ ...v, senha }))} />
            {erro ? <p className="text-sm text-red-400">{erro}</p> : null}
            <button disabled={enviando} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Campo({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-xs font-semibold text-slate-400">
      {label}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand-500"
      />
    </label>
  );
}
