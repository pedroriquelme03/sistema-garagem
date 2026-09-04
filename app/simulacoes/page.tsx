"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useAcesso } from "@/components/AcessoProvider";
import { CadeadoUpgrade, IconeCadeado } from "@/components/FaixaUpgrade";
import { temRecurso } from "@/lib/acesso/tipos";
import CalculadoraRetorno from "@/components/CalculadoraRetorno";
import { formatBRL, parseBRL } from "@/lib/anuncios";
import { listarClientes, type Cliente } from "@/lib/clientes";
import { listarSimulacoesPorCliente, salvarSimulacao } from "@/lib/simulacao/historico";
import { estimarOfertas } from "@/lib/simulacao/price";
import { carregarTabelasBancos } from "@/lib/simulacao/tabelas";
import { PRAZOS_PADRAO, type OfertaSimulacao, type SimulacaoApiResult, type SimulacaoSalva } from "@/lib/simulacao/types";
import { listarVeiculos, nomeVeiculo, type Veiculo } from "@/lib/veiculos";

type Aba = "parcelas" | "retorno";

function money(value: string) {
  const amount = parseBRL(value);
  return amount === undefined ? value : amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function statusLabel(status: OfertaSimulacao["status"]) {
  if (status === "estimativa") return "Estimativa";
  if (status === "pre_aprovado") return "Pré-aprovado (mock)";
  if (status === "condicionado") return "Condicionado (mock)";
  return "Recusado (mock)";
}

function SimularFinanciamento() {
  const searchParams = useSearchParams();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [valor, setValor] = useState("");
  const [entrada, setEntrada] = useState("");
  const [prazos, setPrazos] = useState<number[]>([12, 24, 36, 48]);
  const [ofertas, setOfertas] = useState<OfertaSimulacao[]>([]);
  const [provedor, setProvedor] = useState<SimulacaoApiResult | null>(null);
  const [historico, setHistorico] = useState<SimulacaoSalva[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const listaClientes = listarClientes();
    const listaVeiculos = listarVeiculos();
    setClientes(listaClientes);
    setVeiculos(listaVeiculos);
    const clienteParam = searchParams.get("clienteId") ?? "";
    const veiculoParam = searchParams.get("veiculoId") ?? "";
    if (clienteParam) setClienteId(clienteParam);
    if (veiculoParam) {
      setVeiculoId(veiculoParam);
      const veiculo = listaVeiculos.find(item => item.id === veiculoParam);
      if (veiculo?.valorVenda && !searchParams.get("valor")) setValor(veiculo.valorVenda);
    }
    const valorParam = searchParams.get("valor");
    if (valorParam) setValor(valorParam);
  }, [searchParams]);

  useEffect(() => {
    setHistorico(clienteId ? listarSimulacoesPorCliente(clienteId) : []);
  }, [clienteId]);

  const veiculo = veiculos.find(item => item.id === veiculoId);
  const cliente = clientes.find(item => item.id === clienteId);
  const valorNumerico = parseBRL(valor) ?? 0;
  const entradaNumerica = parseBRL(entrada) ?? 0;
  const financiado = Math.max(0, valorNumerico - entradaNumerica);

  function togglePrazo(prazo: number) {
    setPrazos(old => old.includes(prazo) ? old.filter(item => item !== prazo) : [...old, prazo].sort((a, b) => a - b));
  }

  async function simular(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setProvedor(null);
    if (valorNumerico <= 0) { setError("Informe o valor do veículo."); return; }
    if (entradaNumerica >= valorNumerico) { setError("A entrada precisa ser menor que o valor do veículo."); return; }
    if (!prazos.length) { setError("Escolha ao menos um prazo."); return; }

    const tabelas = carregarTabelasBancos();
    const pedido = {
      valorBem: valorNumerico,
      entrada: entradaNumerica,
      prazos,
      clienteId: clienteId || undefined,
      veiculoId: veiculoId || undefined,
      tabelas,
    };
    const locais = estimarOfertas(pedido);
    setOfertas(locais);
    setAviso("Parcelas calculadas na Tabela Price com as taxas cadastradas em Configurações. Não é aprovação de crédito.");
    setLoading(true);
    try {
      const resp = await fetch("/api/simulacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      const json: SimulacaoApiResult = await resp.json();
      if (!json.ok) {
        setError(json.error ?? "Não foi possível consultar o provedor.");
      } else {
        setProvedor(json);
        if (json.aviso) setAviso(json.aviso);
      }
      const registro: SimulacaoSalva = {
        id: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
        clienteId: clienteId || undefined,
        veiculoId: veiculoId || undefined,
        valorBem: valorNumerico,
        entrada: entradaNumerica,
        prazos,
        ofertas: json.ok && json.ofertas.length ? json.ofertas : locais,
      };
      salvarSimulacao(registro);
      if (clienteId) setHistorico(listarSimulacoesPorCliente(clienteId));
    } catch {
      setError("Falha de rede ao consultar o provedor. A estimativa local já está na tela.");
      salvarSimulacao({
        id: crypto.randomUUID(),
        criadoEm: new Date().toISOString(),
        clienteId: clienteId || undefined,
        veiculoId: veiculoId || undefined,
        valorBem: valorNumerico,
        entrada: entradaNumerica,
        prazos,
        ofertas: locais,
      });
    } finally {
      setLoading(false);
    }
  }

  const melhorEstimativa = useMemo(() => ofertas[0], [ofertas]);

  return (
    <div>
      <form onSubmit={simular} className="space-y-6">
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">Dados da simulação</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Cliente
              <select value={clienteId} onChange={e => setClienteId(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="">Sem cliente (só estimar parcela)</option>
                {clientes.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Veículo
              <select value={veiculoId} onChange={e => {
                setVeiculoId(e.target.value);
                const escolhido = veiculos.find(item => item.id === e.target.value);
                if (escolhido?.valorVenda) setValor(escolhido.valorVenda);
              }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="">Informar valor manualmente</option>
                {veiculos.filter(item => item.status !== "Vendido").map(item => <option key={item.id} value={item.id}>{nomeVeiculo(item)} {item.placa ? `· ${item.placa}` : ""}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Valor do veículo
              <input value={valor} onChange={e => setValor(e.target.value)} onBlur={() => setValor(money(valor))} placeholder="R$ 0,00" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            </label>
            <label className="text-xs font-semibold text-slate-600">Entrada
              <input value={entrada} onChange={e => setEntrada(e.target.value)} onBlur={() => setEntrada(money(entrada))} placeholder="R$ 0,00" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500">A financiar: <strong>{formatBRL(financiado)}</strong>{veiculo ? ` · ${nomeVeiculo(veiculo)}` : ""}{cliente ? ` · ${cliente.nome}` : ""}</p>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-600">Prazos</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRAZOS_PADRAO.map(prazo => (
                <label key={prazo} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium ${prazos.includes(prazo) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"}`}>
                  <input type="checkbox" checked={prazos.includes(prazo)} onChange={() => togglePrazo(prazo)} className="sr-only" />
                  {prazo}x
                </label>
              ))}
            </div>
          </div>
          <button disabled={loading} className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Consultando..." : "Simular"}</button>
        </section>
      </form>

      {aviso && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{aviso}</p>}

      {ofertas.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Estimativa da loja</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {melhorEstimativa ? `Menor parcela: ${formatBRL(melhorEstimativa.parcela)} em ${melhorEstimativa.prazo}x (${melhorEstimativa.banco}).` : ""}
              {" "}CET aproximado considera só os juros da tabela — sem IOF nem tarifas.
            </p>
          </div>
          <TabelaOfertas ofertas={ofertas} />
        </section>
      )}

      {provedor && provedor.ofertas.length > 0 && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Resposta do provedor</h2>
            <p className="mt-0.5 text-xs text-slate-500">Origem: {provedor.origem}. Enquanto o contrato com hub/banco não existir, isso só aparece com SIMULACAO_PROVIDER=mock.</p>
          </div>
          <TabelaOfertas ofertas={provedor.ofertas} mostrarStatus />
        </section>
      )}

      {historico.length > 0 && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900">Histórico deste cliente</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {historico.slice(0, 8).map(item => {
              const melhor = [...item.ofertas].sort((a, b) => a.parcela - b.parcela)[0];
              return (
                <li key={item.id} className="rounded-xl border border-slate-100 px-4 py-3">
                  <p className="font-medium text-slate-800">{new Date(item.criadoEm).toLocaleString("pt-BR")}</p>
                  <p className="mt-1 text-xs text-slate-500">Bem {formatBRL(item.valorBem)} · entrada {formatBRL(item.entrada)}{melhor ? ` · menor parcela ${formatBRL(melhor.parcela)} (${melhor.banco} ${melhor.prazo}x)` : ""}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function TabelaOfertas({ ofertas, mostrarStatus }: { ofertas: OfertaSimulacao[]; mostrarStatus?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-6 py-3">Tabela</th>
            <th className="py-3">Prazo</th>
            <th className="py-3">Parcela</th>
            <th className="py-3">Taxa a.m.</th>
            <th className="py-3">CET a.a.*</th>
            <th className="py-3">Retorno loja</th>
            {mostrarStatus && <th className="px-6 py-3">Status</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {ofertas.map(oferta => (
            <tr key={`${oferta.origem}-${oferta.bancoId}-${oferta.prazo}`}>
              <td className="px-6 py-3 font-medium text-slate-800">{oferta.banco}</td>
              <td className="py-3 text-slate-700">{oferta.prazo}x</td>
              <td className="py-3 font-semibold text-slate-900">{oferta.parcela.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
              <td className="py-3 text-slate-700">{oferta.taxaMensalPct.toFixed(2).replace(".", ",")}%</td>
              <td className="py-3 text-slate-700">{oferta.cetAnualPct.toFixed(1).replace(".", ",")}%</td>
              <td className="py-3 text-slate-700">{formatBRL(oferta.retornoLoja)}</td>
              {mostrarStatus && <td className="px-6 py-3 text-xs font-semibold text-slate-600">{statusLabel(oferta.status)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Financiamento() {
  const searchParams = useSearchParams();
  const { sessao } = useAcesso();
  const bancosMaster = temRecurso(sessao?.loja, "fandi") || temRecurso(sessao?.loja, "bv");
  const [aba, setAba] = useState<Aba>(searchParams.get("aba") === "retorno" && bancosMaster ? "retorno" : "parcelas");
  const retorno = aba === "retorno";

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">Financiamento</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{retorno ? "Retorno financeiro" : "Simular parcelas"}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {retorno
              ? "R0 a R6 sobre o valor financiado, menos ILA, menos imposto. 20% do líquido vai para o vendedor; o restante fica na loja."
              : bancosMaster
                ? "Master inclui FANDI e Banco BV no sistema. Enquanto o contrato não estiver homologado, o cálculo continua como estimativa Price — rotulado com clareza, sem fingir aprovação."
                : "Estimativa Price faz parte do Essencial: um cadastro, várias tabelas. FANDI e Banco BV ficam no Master. No Pro, a FIPE ajuda a precificar o carro antes de simular."}
          </p>
        </div>
        {retorno ? null : <Link href="/configuracoes" className="text-sm font-semibold text-brand-600">Editar taxas da loja →</Link>}
      </header>

      <div className="mb-6 flex gap-6 border-b border-slate-200">
        <button type="button" onClick={() => setAba("parcelas")} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-1 pb-3 text-sm font-semibold ${!retorno ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>Parcelas</button>
        <button type="button" onClick={() => setAba("retorno")} className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-1 pb-3 text-sm font-semibold ${retorno ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          Retorno
          {!bancosMaster ? <IconeCadeado className="h-3.5 w-3.5 text-slate-400" /> : null}
        </button>
      </div>

      {retorno && !bancosMaster ? (
        <CadeadoUpgrade
          recurso="fandi"
          titulo="Retorno financeiro"
          texto="R0 a R6, ILA e comissão do vendedor. Desbloqueia no Master, junto com FANDI e Banco BV."
        >
          <p className="text-sm text-slate-600">Líquido da loja · comissão do vendedor · ILA FIPE</p>
        </CadeadoUpgrade>
      ) : null}

      {!retorno ? (
        <div className="space-y-4">
          <CadeadoUpgrade
            recurso="fipe"
            titulo="Parcela a partir da FIPE"
            texto="A simulação Price já está liberada. No Pro o valor de tabela entra no cadastro do carro, então a parcela parte de um preço de mercado."
          />
          <CadeadoUpgrade
            recurso="fandi"
            titulo="FANDI e Banco BV"
            texto="Simular nos bancos dentro do sistema. Desbloqueia no Master."
          >
            <p className="text-sm text-slate-600">Tabelas FANDI · Banco BV · retorno da loja</p>
          </CadeadoUpgrade>
          {bancosMaster ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              FANDI e Banco BV entram neste plano para simular tudo dentro do sistema. A conexão real com os bancos ainda depende do contrato — até lá as ofertas aparecem como estimativa.
            </p>
          ) : null}
          <SimularFinanciamento />
        </div>
      ) : bancosMaster ? <CalculadoraRetorno /> : null}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-sm text-slate-500">Carregando simulador...</div>}>
      <Financiamento />
    </Suspense>
  );
}
