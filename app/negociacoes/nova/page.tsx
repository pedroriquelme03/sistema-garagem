"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import ClienteForm from "@/components/ClienteForm";
import { parseBRL } from "@/lib/anuncios";
import { clienteInicial, filtrarClientes, listarClientes, salvarCliente, type Cliente, type ClienteForm as Form, type Pessoa } from "@/lib/clientes";
import { gerarContratoHtml } from "@/lib/contratos";
import { imprimirHtml } from "@/lib/imprimir";
import { carregarDadosLoja } from "@/lib/loja";
import { salvarNegociacao, type FormaPagamento, type ItemPagamento, type Negociacao } from "@/lib/negociacoes";
import type { VehicleInfo } from "@/lib/placa";
import { buscarVeiculoPorId, listarVeiculos, salvarVeiculo, type Veiculo } from "@/lib/veiculos";
import { tirarVeiculoDoSite } from "@/lib/vitrine-client";

type TipoPrincipal = "Venda" | "Compra" | "Consignação";
type VeiculoMini = { marca: string; modelo: string; placa: string; anoFabricacao: string; anoModelo: string; km: string; valor: string };
const veiculoMiniVazio: VeiculoMini = { marca: "", modelo: "", placa: "", anoFabricacao: "", anoModelo: "", km: "", valor: "" };
const formasPagamento: FormaPagamento[] = ["Pix", "Cartão", "Financiamento", "Dinheiro", "Transferência"];

function money(value: string) {
  const clean = value.replace(/[^\d,.-]/g, "");
  if (!clean) return "";
  const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : value;
}
function plate(value: string) { const p = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7); return p.length > 3 ? `${p.slice(0, 3)}-${p.slice(3)}` : p; }
function filtrarVeiculos(veiculos: Veiculo[], termo: string) {
  const busca = termo.toLowerCase();
  return veiculos.filter(v => [v.marca, v.modelo, v.placa].join(" ").toLowerCase().includes(busca));
}
function resumoVeiculo(v: Veiculo) { return [v.marca, v.modelo].filter(Boolean).join(" ") || "Veículo sem marca/modelo"; }

function NovaNegociacao() {
  const searchParams = useSearchParams();
  const [tipo, setTipo] = useState<TipoPrincipal>("Venda");
  const [responsavelLoja, setResponsavelLoja] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [mostrarNovoCliente, setMostrarNovoCliente] = useState(false);
  const [pessoaNovoCliente, setPessoaNovoCliente] = useState<Pessoa>("fisica");
  const [formNovoCliente, setFormNovoCliente] = useState<Form>(clienteInicial);
  const [erroNovoCliente, setErroNovoCliente] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [buscaVeiculo, setBuscaVeiculo] = useState("");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);
  const [modoVeiculo, setModoVeiculo] = useState<"estoque" | "novo">("estoque");
  const [veiculoNovo, setVeiculoNovo] = useState<VeiculoMini>(veiculoMiniVazio);

  const [trocaAtiva, setTrocaAtiva] = useState(false);
  const [trocaForm, setTrocaForm] = useState<VeiculoMini>(veiculoMiniVazio);
  const [buscandoPlaca, setBuscandoPlaca] = useState(false);

  const [valor, setValor] = useState("");
  const [pagamentos, setPagamentos] = useState<ItemPagamento[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setClientes(listarClientes());
    const veiculosCarregados = listarVeiculos();
    setVeiculos(veiculosCarregados);
    const tipoParam = searchParams.get("tipo");
    if (tipoParam === "Venda" || tipoParam === "Compra" || tipoParam === "Consignação") setTipo(tipoParam);
    const veiculoId = searchParams.get("veiculoId");
    if (veiculoId) {
      const encontrado = veiculosCarregados.find(v => v.id === veiculoId);
      if (encontrado) setVeiculoSelecionado(encontrado);
      else setError("Veículo não encontrado no estoque. Selecione outro abaixo.");
    }
  }, [searchParams]);

  function escolherTipo(novoTipo: TipoPrincipal) {
    setSucesso(false); setError(null); setTipo(novoTipo);
    if (novoTipo !== "Venda") { setTrocaAtiva(false); setTrocaForm(veiculoMiniVazio); }
  }

  function selecionarCliente(cliente: Cliente) { setClienteSelecionado(cliente); setBuscaCliente(""); setMostrarNovoCliente(false); }
  function setCampoNovoCliente(key: string, value: string) { setFormNovoCliente(old => ({ ...old, [key]: value })); }
  async function buscarCepNovoCliente() {
    const cep = formNovoCliente.cep.replace(/\D/g, "");
    if (cep.length !== 8) { setErroNovoCliente("Digite os 8 números do CEP."); return; }
    setLoadingCep(true); setErroNovoCliente(null);
    try {
      const response = await fetch(`/api/cep?cep=${cep}`);
      const json = await response.json();
      if (!json.ok) { setErroNovoCliente(json.error ?? "CEP não encontrado."); return; }
      setFormNovoCliente(old => ({ ...old, cep: json.data.cep || old.cep, endereco: json.data.endereco || "", bairro: json.data.bairro || "", municipio: json.data.municipio || "", uf: json.data.uf || "", codigoMunicipio: json.data.codigoMunicipio || "", complemento: json.data.complementoCep || old.complemento }));
    } catch { setErroNovoCliente("Falha de rede ao buscar o CEP."); } finally { setLoadingCep(false); }
  }
  function confirmarNovoCliente() {
    if (!formNovoCliente.nome || !formNovoCliente.documento || !formNovoCliente.telefone || !formNovoCliente.cep || !formNovoCliente.endereco || !formNovoCliente.numero) { setErroNovoCliente("Preencha os campos obrigatórios, inclusive endereço e número."); return; }
    const registro: Cliente = { id: crypto.randomUUID(), pessoa: pessoaNovoCliente, ...formNovoCliente };
    setClientes(salvarCliente(registro));
    selecionarCliente(registro);
    setFormNovoCliente(clienteInicial); setPessoaNovoCliente("fisica"); setErroNovoCliente(null);
  }

  function selecionarVeiculo(v: Veiculo) { setVeiculoSelecionado(v); setBuscaVeiculo(""); }
  function setCampoVeiculoNovo(key: keyof VeiculoMini, value: string) { setVeiculoNovo(old => ({ ...old, [key]: value })); }
  function setCampoTroca(key: keyof VeiculoMini, value: string) { setTrocaForm(old => ({ ...old, [key]: value })); }
  async function buscarPelaPlaca(valores: VeiculoMini, set: (key: keyof VeiculoMini, value: string) => void) {
    const placa = valores.placa.replace(/\W/g, "");
    if (placa.length !== 7) { setError("Digite uma placa válida com 7 caracteres."); return; }
    setBuscandoPlaca(true); setError(null);
    try {
      const response = await fetch(`/api/consulta-placa?placa=${placa}`);
      const json: { ok: boolean; data?: VehicleInfo; error?: string } = await response.json();
      if (!json.ok || !json.data) { setError(json.error ?? "Veículo não encontrado."); return; }
      const v = json.data;
      if (v.marca) set("marca", v.marca);
      if (v.modelo) set("modelo", v.modelo);
      if (v.ano) set("anoFabricacao", v.ano);
      if (v.anoModelo) set("anoModelo", v.anoModelo);
    } catch { setError("Falha de rede ao consultar a placa."); } finally { setBuscandoPlaca(false); }
  }

  function addPagamento() { setPagamentos(old => [...old, { id: crypto.randomUUID(), forma: "Pix", valor: "" }]); }
  function updatePagamento(id: string, patch: Partial<ItemPagamento>) { setPagamentos(old => old.map(item => item.id === id ? { ...item, ...patch } : item)); }
  function removerPagamento(id: string) { setPagamentos(old => old.filter(item => item.id !== id)); }

  const somaPagamentos = pagamentos.reduce((soma, item) => soma + (parseBRL(item.valor) ?? 0), 0);
  const valorTotalNumerico = parseBRL(valor) ?? 0;
  const valorTrocaNumerico = tipo === "Venda" && trocaAtiva ? (parseBRL(trocaForm.valor) ?? 0) : 0;
  const valorAReceber = Math.max(0, valorTotalNumerico - valorTrocaNumerico);
  const faltante = valorAReceber - somaPagamentos;
  const pagamentosBatem = !pagamentos.length || Math.abs(faltante) < 0.01;

  function salvar(event: FormEvent) {
    event.preventDefault();
    setSucesso(false);
    if (!responsavelLoja.trim()) { setError("Informe o responsável da loja pela negociação."); return; }
    if (!clienteSelecionado) { setError("Selecione um cliente já cadastrado ou cadastre um novo."); return; }
    if (!valor) { setError("Informe o valor da negociação."); return; }
    if (!pagamentosBatem) { setError(valorTrocaNumerico > 0 ? "A soma das formas de pagamento precisa bater com o valor a receber (valor total descontado o carro da troca)." : "A soma das formas de pagamento precisa bater com o valor total da negociação."); return; }
    if (tipo === "Venda" && !veiculoSelecionado) { setError("Selecione o veículo do estoque que está sendo vendido."); return; }
    if (tipo !== "Venda" && modoVeiculo === "estoque" && !veiculoSelecionado) { setError("Selecione o veículo do estoque ou cadastre um veículo novo."); return; }
    if (tipo !== "Venda" && modoVeiculo === "novo" && (!veiculoNovo.marca || !veiculoNovo.modelo)) { setError("Preencha ao menos marca e modelo do veículo novo."); return; }
    if (tipo === "Venda" && trocaAtiva && (!trocaForm.marca || !trocaForm.modelo || !trocaForm.valor)) { setError("Preencha marca, modelo e valor do veículo dado na troca."); return; }

    let veiculoPrincipalId: string;
    if (tipo === "Venda" || modoVeiculo === "estoque") {
      veiculoPrincipalId = veiculoSelecionado!.id;
    } else {
      const novoId = crypto.randomUUID();
      salvarVeiculo({ id: novoId, marca: veiculoNovo.marca, modelo: veiculoNovo.modelo, placa: veiculoNovo.placa, anoFabricacao: veiculoNovo.anoFabricacao, anoModelo: veiculoNovo.anoModelo, km: veiculoNovo.km, status: "Cadastrado", tipoEstoque: "Próprio", criadoEm: new Date().toISOString() });
      veiculoPrincipalId = novoId;
    }

    const negociacaoId = crypto.randomUUID();
    const negociacaoPrincipal: Negociacao = { id: negociacaoId, tipo, veiculoId: veiculoPrincipalId, clienteId: clienteSelecionado.id, responsavelLoja, valor, pagamentos, criadoEm: new Date().toISOString() };

    if (tipo === "Venda") {
      const veiculoAtual = buscarVeiculoPorId(veiculoPrincipalId);
      if (veiculoAtual) {
        salvarVeiculo({ ...veiculoAtual, status: "Vendido" });
        void tirarVeiculoDoSite(veiculoPrincipalId);
      }
      if (trocaAtiva) {
        const trocaVeiculoId = crypto.randomUUID();
        salvarVeiculo({ id: trocaVeiculoId, marca: trocaForm.marca, modelo: trocaForm.modelo, placa: trocaForm.placa, anoFabricacao: trocaForm.anoFabricacao, anoModelo: trocaForm.anoModelo, km: trocaForm.km, status: "Cadastrado", tipoEstoque: "Próprio", criadoEm: new Date().toISOString() });
        const trocaNegociacaoId = crypto.randomUUID();
        salvarNegociacao({ id: trocaNegociacaoId, tipo: "Troca", veiculoId: trocaVeiculoId, clienteId: clienteSelecionado.id, responsavelLoja, valor: trocaForm.valor, pagamentos: [], criadoEm: new Date().toISOString(), negociacaoOrigemId: negociacaoId });
        negociacaoPrincipal.trocaVeiculoId = trocaVeiculoId;
        negociacaoPrincipal.trocaNegociacaoId = trocaNegociacaoId;
      }
    } else if (modoVeiculo === "estoque" && veiculoSelecionado && !veiculoSelecionado.status) {
      salvarVeiculo({ ...veiculoSelecionado, status: "Cadastrado" });
    }

    salvarNegociacao(negociacaoPrincipal);

    const veiculoParaContrato = buscarVeiculoPorId(veiculoPrincipalId) ?? { id: veiculoPrincipalId, marca: veiculoNovo.marca || veiculoSelecionado?.marca || "", modelo: veiculoNovo.modelo || veiculoSelecionado?.modelo || "" };
    const html = gerarContratoHtml(negociacaoPrincipal, veiculoParaContrato as Veiculo, clienteSelecionado, carregarDadosLoja());
    const impresso = imprimirHtml(html);
    setError(impresso ? null : "Negociação salva, mas o navegador bloqueou a janela de impressão do contrato. Libere os pop-ups e tente novamente pela tela da negociação.");
    setSucesso(true);
  }

  const resultadosCliente = buscaCliente ? filtrarClientes(clientes, buscaCliente).slice(0, 6) : [];
  const resultadosVeiculo = buscaVeiculo ? filtrarVeiculos(veiculos, buscaVeiculo).slice(0, 6) : [];

  return <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
    <header className="mb-7 flex items-end justify-between"><div><p className="text-sm font-medium text-brand-600">Negociação</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Nova negociação</h1><p className="mt-1 text-sm text-slate-500">Registre a venda, compra ou consignação e gere o contrato.</p></div><Link href="/negociacoes" className="text-sm font-semibold text-slate-600">← Negociações</Link></header>

    <form onSubmit={salvar} className="space-y-6">
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {sucesso && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Negociação salva. <Link href="/negociacoes" className="font-semibold underline">Ver negociações</Link></p>}

      <Card title="Tipo de negociação"><div className="grid grid-cols-3 gap-3">{(["Venda", "Compra", "Consignação"] as TipoPrincipal[]).map(item => <button type="button" key={item} onClick={() => escolherTipo(item)} className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${tipo === item ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"}`}>{item}</button>)}</div></Card>

      <Card title="Responsável"><Input label="Responsável pela loja" value={responsavelLoja} onChange={setResponsavelLoja} placeholder="Nome do vendedor"/></Card>

      <Card title="Cliente">
        {clienteSelecionado ? <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-sm font-semibold text-slate-800">{clienteSelecionado.nome}</p><p className="text-xs text-slate-500">{clienteSelecionado.documento} · {clienteSelecionado.telefone}</p></div><button type="button" onClick={() => setClienteSelecionado(null)} className="text-sm font-semibold text-brand-600">Trocar</button></div> : <>
          <input value={buscaCliente} onChange={e => setBuscaCliente(e.target.value)} placeholder="Buscar cliente por nome, documento ou telefone" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/>
          {resultadosCliente.length > 0 && <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">{resultadosCliente.map(cliente => <button type="button" key={cliente.id} onClick={() => selecionarCliente(cliente)} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"><span className="font-medium text-slate-800">{cliente.nome}</span><span className="ml-2 text-xs text-slate-500">{cliente.documento}</span></button>)}</div>}
          <button type="button" onClick={() => setMostrarNovoCliente(old => !old)} className="mt-3 text-sm font-semibold text-brand-600">{mostrarNovoCliente ? "Cancelar cadastro" : "+ Cadastrar cliente novo"}</button>
          {mostrarNovoCliente && <div className="mt-4 space-y-4 rounded-xl border border-dashed border-slate-300 p-4">
            <div className="flex gap-3">{(["fisica", "juridica"] as Pessoa[]).map(item => <button type="button" key={item} onClick={() => setPessoaNovoCliente(item)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${pessoaNovoCliente === item ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}>{item === "fisica" ? "Pessoa física" : "Pessoa jurídica"}</button>)}</div>
            <ClienteForm pessoa={pessoaNovoCliente} form={formNovoCliente} set={setCampoNovoCliente} error={erroNovoCliente} loadingCep={loadingCep} onBuscarCep={buscarCepNovoCliente}/>
            <button type="button" onClick={confirmarNovoCliente} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Confirmar cadastro do cliente</button>
          </div>}
        </>}
      </Card>

      <Card title="Veículo">
        {tipo !== "Venda" && <div className="mb-4 flex gap-3">{(["estoque", "novo"] as const).map(item => <button type="button" key={item} onClick={() => setModoVeiculo(item)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${modoVeiculo === item ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}>{item === "estoque" ? "Veículo já no estoque" : "Veículo novo"}</button>)}</div>}
        {(tipo === "Venda" || modoVeiculo === "estoque") ? (veiculoSelecionado ? <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-sm font-semibold text-slate-800">{resumoVeiculo(veiculoSelecionado)}</p><p className="text-xs text-slate-500">{veiculoSelecionado.placa || "sem placa"}</p></div><button type="button" onClick={() => setVeiculoSelecionado(null)} className="text-sm font-semibold text-brand-600">Trocar</button></div> : <>
          <input value={buscaVeiculo} onChange={e => setBuscaVeiculo(e.target.value)} placeholder="Buscar veículo por marca, modelo ou placa" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/>
          {resultadosVeiculo.length > 0 && <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">{resultadosVeiculo.map(v => <button type="button" key={v.id} onClick={() => selecionarVeiculo(v)} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"><span className="font-medium text-slate-800">{resumoVeiculo(v)}</span><span className="ml-2 text-xs text-slate-500">{v.placa}</span></button>)}</div>}
        </>) : <VeiculoCampos valores={veiculoNovo} set={setCampoVeiculoNovo} onBuscarPlaca={() => buscarPelaPlaca(veiculoNovo, setCampoVeiculoNovo)} buscandoPlaca={buscandoPlaca}/>}
      </Card>

      {tipo === "Venda" && <Card title="Troca">
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={trocaAtiva} onChange={e => setTrocaAtiva(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600"/>O cliente está dando um carro na troca</label>
        {trocaAtiva && <div className="mt-4"><VeiculoCampos valores={trocaForm} set={setCampoTroca} comValor onBuscarPlaca={() => buscarPelaPlaca(trocaForm, setCampoTroca)} buscandoPlaca={buscandoPlaca}/></div>}
      </Card>}

      <Card title="Valor da negociação">
        <Input label="Valor total" value={valor} onChange={setValor} onBlur={() => setValor(money(valor))} placeholder="R$ 0,00"/>
        {tipo === "Venda" && clienteSelecionado && veiculoSelecionado && <Link href={`/simulacoes?clienteId=${clienteSelecionado.id}&veiculoId=${veiculoSelecionado.id}&valor=${encodeURIComponent(valor)}`} className="mt-3 inline-block text-sm font-semibold text-brand-600">Simular financiamento com estes dados →</Link>}
      </Card>

      <Card title="Formas de pagamento">
        {valorTrocaNumerico > 0 && <p className="mb-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">Valor total: <strong>{valorTotalNumerico.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong> − carro na troca: <strong>{valorTrocaNumerico.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong> = a receber nas formas abaixo: <strong>{valorAReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>}
        {pagamentos.map(item => <div key={item.id} className="mb-3 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <select value={item.forma} onChange={e => updatePagamento(item.id, { forma: e.target.value as FormaPagamento })} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">{formasPagamento.map(forma => <option key={forma}>{forma}</option>)}</select>
          <input value={item.valor} onChange={e => updatePagamento(item.id, { valor: e.target.value })} onBlur={() => updatePagamento(item.id, { valor: money(item.valor) })} placeholder="R$ 0,00" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"/>
          {item.forma === "Financiamento" ? <input value={item.banco ?? ""} onChange={e => updatePagamento(item.id, { banco: e.target.value })} placeholder="Banco/instituição" className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"/> : <div/>}
          <button type="button" onClick={() => removerPagamento(item.id)} className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600">Remover</button>
        </div>)}
        <button type="button" onClick={addPagamento} className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">+ Adicionar forma de pagamento</button>
        {pagamentos.length > 0 && <p className={`mt-3 text-xs font-medium ${pagamentosBatem ? "text-emerald-700" : "text-red-600"}`}>
          Soma das formas: {somaPagamentos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de {valorAReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} a receber
          {pagamentosBatem ? " — confere." : faltante > 0 ? ` — faltam ${faltante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` : ` — ${Math.abs(faltante).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} a mais do que o valor a receber`}
        </p>}
      </Card>

      <div className="sticky bottom-3 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg"><Link href="/negociacoes" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</Link><button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">Salvar e gerar contrato</button></div>
    </form>
  </div>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">{title}</h2><div className="mt-5">{children}</div></section>; }
function Input({ label, value, onChange, onBlur, placeholder }: { label: string; value: string; onChange: (value: string) => void; onBlur?: () => void; placeholder?: string }) { return <label className="text-xs font-semibold text-slate-600">{label}<input value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>; }
function VeiculoCampos({ valores, set, comValor, onBuscarPlaca, buscandoPlaca }: { valores: VeiculoMini; set: (key: keyof VeiculoMini, value: string) => void; comValor?: boolean; onBuscarPlaca?: () => void; buscandoPlaca?: boolean }) {
  return <div className="grid gap-4 sm:grid-cols-2">
    <div className="sm:col-span-2">
      <label className="text-xs font-semibold text-slate-600">Placa</label>
      <div className="mt-2 flex gap-2">
        <input value={valores.placa} onChange={e => set("placa", plate(e.target.value))} placeholder="ABC-1234" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/>
        {onBuscarPlaca && <button type="button" onClick={onBuscarPlaca} disabled={buscandoPlaca} className="shrink-0 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-semibold text-brand-700 disabled:opacity-60">{buscandoPlaca ? "Buscando..." : "Buscar pela placa"}</button>}
      </div>
      <p className="mt-1 text-[11px] text-slate-400">Preenche marca, modelo e ano automaticamente. Confira antes de salvar.</p>
    </div>
    <Input label="Marca" value={valores.marca} onChange={v => set("marca", v)}/>
    <Input label="Modelo" value={valores.modelo} onChange={v => set("modelo", v)}/>
    <Input label="Ano fabricação/modelo" value={[valores.anoFabricacao, valores.anoModelo].filter(Boolean).join("/")} onChange={v => { const [fab, mod] = v.split("/"); set("anoFabricacao", fab ?? ""); set("anoModelo", mod ?? ""); }} placeholder="2020/2021"/>
    <Input label="Quilometragem" value={valores.km} onChange={v => set("km", v)}/>
    {comValor && <Input label="Valor de avaliação" value={valores.valor} onChange={v => set("valor", v)} onBlur={() => set("valor", money(valores.valor))} placeholder="R$ 0,00"/>}
  </div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-slate-500">Carregando negociação...</div>}>
      <NovaNegociacao />
    </Suspense>
  );
}
