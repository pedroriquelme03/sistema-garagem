"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { FipeEntry, VehicleInfo } from "@/lib/placa";

type Form = Record<string, string>;
const initial: Form = { placa: "", chassi: "", renavam: "", tipo: "Automóvel", condicao: "Usado", marca: "", modelo: "", versao: "", anoFabricacao: "", anoModelo: "", cor: "", combustivel: "", portas: "4", carroceria: "", cambio: "", km: "", garantia: "Sem garantia", tipoEstoque: "Próprio", valorCompra: "", valorVenda: "" };
function plate(value: string) { const p = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7); return p.length > 3 ? `${p.slice(0, 3)}-${p.slice(3)}` : p; }
function fuel(value?: string) {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("alcool") && normalized.includes("gas")) return "Flex (Álcool / Gasolina)";
  if (normalized.includes("diesel")) return "Diesel";
  if (normalized.includes("eletr")) return "Elétrico";
  if (normalized.includes("hibr")) return "Híbrido";
  if (normalized.includes("gas")) return "Gasolina";
  return value ?? "";
}
function money(value: string) {
  const clean = value.replace(/[^\d,.-]/g, "");
  if (!clean) return "";
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : value;
}
function family(value: string) {
  const parts = value.trim().split(/\s+/);
  return ["classe", "grand", "new", "nova"].includes(parts[0]?.toLowerCase()) && parts[1] ? `${parts[0]} ${parts[1]}` : (parts[0] ?? value);
}

export default function AdicionarVeiculo() {
  const [form, setForm] = useState<Form>(initial);
  const [options, setOptions] = useState<FipeEntry[]>([]);
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [fipe, setFipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (key: string, value: string) => setForm(old => ({ ...old, [key]: value }));
  const fipeVersions = Array.from(new Set(options.map(item => item.descricao).filter((item): item is string => Boolean(item))));
  const fipeModels = Object.keys(catalog).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const versions = catalog[form.modelo] ?? fipeVersions;

  async function buscar() {
    const placa = form.placa.replace(/\W/g, "");
    if (placa.length !== 7) { setError("Digite uma placa válida com 7 caracteres."); return; }
    setLoading(true); setError(null); setDone(false); setOptions([]); setFipe(null);
    try {
      const response = await fetch(`/api/consulta-placa?placa=${placa}`);
      const json: { ok: boolean; data?: VehicleInfo; error?: string } = await response.json();
      if (!json.ok || !json.data) { setError(json.error ?? "Veículo não encontrado."); return; }
      const vehicle = json.data;
      setOptions(vehicle.fipe);
      setFipe(vehicle.fipe[0]?.valor ?? null);
      const modeloSugerido = family(vehicle.fipe[0]?.descricao ?? vehicle.modelo ?? "");
      setForm(old => ({ ...old, placa: plate(vehicle.placa || placa), marca: vehicle.marca ?? old.marca, modelo: modeloSugerido || old.modelo, versao: vehicle.fipe[0]?.descricao ?? vehicle.versao ?? old.versao, anoFabricacao: vehicle.ano ?? old.anoFabricacao, anoModelo: vehicle.anoModelo ?? old.anoModelo, cor: vehicle.cor ?? old.cor, combustivel: fuel(vehicle.combustivel) || old.combustivel, chassi: vehicle.chassi ?? old.chassi, renavam: vehicle.renavam ?? old.renavam, carroceria: vehicle.segmento ?? old.carroceria }));
      if (vehicle.marca) {
        const anoCatalogo = vehicle.anoModelo ?? vehicle.ano ?? "";
        const catalogo = await fetch(`/api/fipe-modelos?marca=${encodeURIComponent(vehicle.marca)}&ano=${encodeURIComponent(anoCatalogo)}`);
        const catalogoJson: { ok: boolean; versoesPorModelo?: Record<string, string[]> } = await catalogo.json();
        if (catalogoJson.ok && catalogoJson.versoesPorModelo) setCatalog(catalogoJson.versoesPorModelo);
      }
    } catch { setError("Falha de rede ao consultar a placa."); } finally { setLoading(false); }
  }

  function salvar(event: FormEvent) {
    event.preventDefault();
    if (!form.marca || !form.modelo || !form.km || !form.valorVenda) { setError("Preencha marca, modelo, quilometragem e valor de venda."); return; }
    const records = JSON.parse(localStorage.getItem("garagem-pro-estoque") ?? "[]");
    records.unshift({ id: crypto.randomUUID(), ...form, criadoEm: new Date().toISOString() });
    localStorage.setItem("garagem-pro-estoque", JSON.stringify(records));
    setError(null); setDone(true);
  }

  return <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
    <header className="mb-7 flex items-end justify-between"><div><p className="text-sm font-medium text-brand-600">Estoque</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Adicionar veículo</h1><p className="mt-1 text-sm text-slate-500">Consulte a placa para acelerar o preenchimento.</p></div><Link href="/estoque" className="text-sm font-semibold text-slate-600">← Estoque</Link></header>
    <form onSubmit={salvar} className="space-y-6">
      <section className="rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:p-6"><p className="text-sm font-semibold text-slate-800">Buscar dados pela placa</p><p className="mt-1 text-xs text-slate-500">Depois da busca, escolha a versão correspondente na FIPE.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={form.placa} onChange={e => set("placa", plate(e.target.value))} placeholder="ABC-1234" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold uppercase tracking-widest outline-none focus:border-brand-500"/><button type="button" onClick={buscar} disabled={loading} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Buscando dados..." : "Buscar veículo"}</button></div>{fipe && <p className="mt-3 text-sm text-emerald-700">FIPE de referência: <strong>{fipe}</strong></p>}</section>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{done && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Veículo cadastrado neste navegador. <Link href="/estoque" className="font-semibold underline">Ver estoque</Link></p>}
      <Card title="Identificação do veículo"><Grid><Input label="Chassi" k="chassi" form={form} set={set}/><Input label="Renavam" k="renavam" form={form} set={set}/><Select label="Tipo" k="tipo" form={form} set={set} options={["Automóvel", "Motocicleta", "Caminhonete", "Caminhão"]}/><Select label="Novo ou usado" k="condicao" form={form} set={set} options={["Usado", "Novo"]}/></Grid></Card>
      <Card title="Dados do veículo"><Grid><Input label="Marca" k="marca" form={form} set={set} required/>{fipeModels.length ? <label className="text-xs font-semibold text-slate-600">Modelo (catálogo FIPE)<select value={form.modelo} onChange={e => setForm(old => ({ ...old, modelo: e.target.value, versao: "" }))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Selecione o modelo</option>{fipeModels.map(model => <option key={model}>{model}</option>)}</select></label> : <Input label="Modelo" k="modelo" form={form} set={set} required/>}{versions.length ? <Select label="Versão (opções FIPE)" k="versao" form={form} set={set} options={versions}/> : <Input label="Versão" k="versao" form={form} set={set}/>}<Input label="Ano fabricação" k="anoFabricacao" form={form} set={set}/><Input label="Ano modelo" k="anoModelo" form={form} set={set}/></Grid></Card>
      <Card title="Características físicas"><Grid><Input label="Cor principal" k="cor" form={form} set={set}/><Select label="Combustível" k="combustivel" form={form} set={set} options={["", "Flex (Álcool / Gasolina)", "Gasolina", "Diesel", "Etanol", "Elétrico", "Híbrido", "GNV"]}/><Select label="Portas" k="portas" form={form} set={set} options={["2", "3", "4", "5"]}/><Input label="Carroceria" k="carroceria" form={form} set={set}/><Select label="Câmbio" k="cambio" form={form} set={set} options={["Manual", "Automático", "Automatizado", "CVT"]}/><Input label="Quilometragem" k="km" form={form} set={set} required placeholder="Ex.: 48.000"/></Grid></Card>
      <Card title="Garantia, estoque e valores"><Grid><Select label="Garantia" k="garantia" form={form} set={set} options={["Sem garantia", "3 meses", "6 meses", "12 meses"]}/><Select label="Tipo de estoque" k="tipoEstoque" form={form} set={set} options={["Próprio", "Consignado", "Repasse"]}/><Input label="Valor de compra" k="valorCompra" form={form} set={set} placeholder="R$ 0,00" currency/><div><Input label="Valor de venda" k="valorVenda" form={form} set={set} required placeholder="R$ 0,00" currency/>{fipe && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">Referência de mercado (FIPE): <strong>{fipe}</strong></p>}</div></Grid></Card>
      <Card title="Documentos"><label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm text-slate-500"><input type="file" accept="image/*,.pdf" className="sr-only"/>↥ Adicionar CRLV (imagem ou PDF)</label></Card>
      <div className="sticky bottom-3 flex justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg"><Link href="/estoque" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</Link><button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Adicionar veículo</button></div>
    </form>
  </div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">{title}</h2><div className="mt-5">{children}</div></section>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2">{children}</div>; }
function Input({ label, k, form, set, required, placeholder, currency }: { label: string; k: string; form: Form; set: (k: string, v: string) => void; required?: boolean; placeholder?: string; currency?: boolean }) { return <label className="text-xs font-semibold text-slate-600">{label}{required && <span className="text-red-500"> *</span>}<input value={form[k]} required={required} onChange={e => set(k, e.target.value)} onBlur={() => currency && set(k, money(form[k]))} placeholder={placeholder} inputMode={currency ? "decimal" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>; }
function Select({ label, k, form, set, options }: { label: string; k: string; form: Form; set: (k: string, v: string) => void; options: string[] }) { return <label className="text-xs font-semibold text-slate-600">{label}<select value={form[k]} onChange={e => set(k, e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">{options.map(option => <option key={option}>{option}</option>)}</select></label>; }
