"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { carregarDadosLoja, salvarDadosLoja, type DadosLoja } from "@/lib/loja";

const vazio: DadosLoja = { nome: "", site: "", whatsapp: "", logo: "" };

export default function Configuracoes() {
  const [dados, setDados] = useState<DadosLoja>(vazio);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => { setDados(carregarDadosLoja()); }, []);

  function set(campo: keyof DadosLoja, valor: string) { setSalvo(false); setDados(old => ({ ...old, [campo]: valor })); }

  function escolherLogo(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => set("logo", String(leitor.result ?? ""));
    leitor.readAsDataURL(arquivo);
    event.target.value = "";
  }

  function salvar(event: FormEvent) {
    event.preventDefault();
    salvarDadosLoja(dados);
    setSalvo(true);
  }

  return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
    <p className="text-sm font-medium text-brand-600">Configurações</p>
    <h1 className="mt-1 text-3xl font-bold text-slate-950">Dados da loja</h1>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Usados no cabide impresso, em anúncios e em outros documentos gerados pelo sistema.</p>
    <form onSubmit={salvar} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-600">Nome da loja<input value={dados.nome} onChange={e => set("nome", e.target.value)} placeholder="Ex.: Indy Carros" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>
        <label className="text-xs font-semibold text-slate-600">Site<input value={dados.site} onChange={e => set("site", e.target.value)} placeholder="https://indycarros.com.br" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>
        <label className="text-xs font-semibold text-slate-600">WhatsApp<input value={dados.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="55 41 9XXXX-XXXX" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-600">Logo da loja</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="grid h-20 w-32 place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">{dados.logo ? <img src={dados.logo} alt="Logo da loja" className="h-full w-full object-contain"/> : <span className="text-[11px] text-slate-400">Sem logo</span>}</div>
          <label className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><input type="file" accept="image/*" className="sr-only" onChange={escolherLogo}/>Escolher imagem</label>
          {dados.logo && <button type="button" onClick={() => set("logo", "")} className="text-xs font-semibold text-red-600">Remover</button>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Salvar</button>
        {salvo && <p className="text-sm text-emerald-700">Dados salvos neste navegador.</p>}
      </div>
    </form>
  </div>;
}
