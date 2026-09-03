"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import type { FipeEntry, VehicleInfo } from "@/lib/placa";
import { carregarFotosDoVeiculo, salvarFotosDoVeiculo } from "@/lib/fotos";
import { carregarDadosLoja } from "@/lib/loja";
import { escapeHtml, imprimirHtml } from "@/lib/imprimir";
import { buscarClientePorId } from "@/lib/clientes";
import { entradaDoVeiculo, saidasDoVeiculo, type Negociacao } from "@/lib/negociacoes";

type Form = Record<string, string>;
type Foto = { id: string; file: File; url: string };
const initial: Form = { placa: "", chassi: "", renavam: "", tipo: "Automóvel", condicao: "Usado", marca: "", modelo: "", versao: "", anoFabricacao: "", anoModelo: "", cor: "", combustivel: "", portas: "4", carroceria: "", cambio: "", km: "", garantia: "Sem garantia", tipoEstoque: "Próprio", valorCompra: "", valorVenda: "", status: "Cadastrado", descricao: "", acessorios: "", cabide1: "", cabide2: "", cabide3: "", cabide4: "", cabide5: "", cabide6: "" };
const acessoriosDisponiveis = ["7 lugares", "Adaptado para deficiente físico", "Aerofólio", "Airbag cortina", "Airbag lateral", "Airbag motorista", "Airbag passageiro", "Ajuste de altura", "Ajuste elétrico", "Alarme", "Alforges/bolsas", "Ar-condicionado", "Ar-condicionado digital", "Ar-quente", "Bagageiro", "Banco bi-partido", "Bancos de couro", "Bancos dianteiros com aquecimento", "Bancos elétricos", "Baús/bauleto laterais", "Blindado", "Calotas", "Câmbio automático", "Câmera de ré", "Capota marítima", "CD player", "Chave presença", "Comando de áudio no volante", "Computador de bordo", "Conexão Bluetooth", "Controle de estabilidade", "Controle de tração", "Desembaçador traseiro", "Farol de neblina", "Farol de xenônio/LED", "Freios ABS", "GPS", "Piloto automático", "Rodas de liga leve", "Sensor de chuva", "Sensor de estacionamento", "Teto solar", "Trava elétrica", "Vidros elétricos", "Volante multifuncional"];
const sugestoesPorPalavraChave: [RegExp, string][] = [
  [/\bAUT\b|AUTOM[ÁA]TIC/i, "Câmbio automático"],
  [/\bCVT\b/i, "Câmbio automático"],
  [/COUR[OA]/i, "Bancos de couro"],
  [/TETO\s*SOLAR|SUNROOF/i, "Teto solar"],
  [/\bABS\b/i, "Freios ABS"],
  [/X[ÊE]N[OÔ]NIO|\bLED\b/i, "Farol de xenônio/LED"],
  [/7\s*LUGARES|7L\b/i, "7 lugares"],
];
function sugerirAcessoriosPelaVersao(texto: string): string[] {
  return sugestoesPorPalavraChave.filter(([regex]) => regex.test(texto)).map(([, item]) => item);
}
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
  const searchParams = useSearchParams();
  const editId = searchParams.get("editar");
  const [form, setForm] = useState<Form>(initial);
  const [options, setOptions] = useState<FipeEntry[]>([]);
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [fipe, setFipe] = useState<string | null>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const fotosRef = useRef<Foto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [alterado, setAlterado] = useState(false);
  const [avisoSalvar, setAvisoSalvar] = useState<string | null>(null);
  const [entrada, setEntrada] = useState<Negociacao | null>(null);
  const [entradaCliente, setEntradaCliente] = useState<string | null>(null);
  const [saidas, setSaidas] = useState<{ negociacao: Negociacao; clienteNome: string | null }[]>([]);
  const set = (key: string, value: string) => { setAlterado(true); setDone(false); setAvisoSalvar(null); setForm(old => ({ ...old, [key]: value })); };
  const fipeVersions = Array.from(new Set(options.map(item => item.descricao).filter((item): item is string => Boolean(item))));
  const fipeModels = Object.keys(catalog).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const versions = catalog[form.modelo] ?? fipeVersions;
  const acessoriosSelecionados = form.acessorios ? form.acessorios.split("|").filter(Boolean) : [];
  useEffect(() => () => { fotosRef.current.forEach(foto => URL.revokeObjectURL(foto.url)); }, []);
  useEffect(() => {
    if (!editId) return;
    const negociacaoEntrada = entradaDoVeiculo(editId) ?? null;
    setEntrada(negociacaoEntrada);
    setEntradaCliente(negociacaoEntrada ? buscarClientePorId(negociacaoEntrada.clienteId)?.nome ?? null : null);
    setSaidas(saidasDoVeiculo(editId).map(negociacao => ({ negociacao, clienteNome: buscarClientePorId(negociacao.clienteId)?.nome ?? null })));
  }, [editId]);
  useEffect(() => {
    if (!editId) return;
    let ativo = true;
    try {
      const records: (Form & { id: string })[] = JSON.parse(localStorage.getItem("garagem-pro-estoque") ?? "[]");
      const vehicle = records.find(item => item.id === editId);
      if (vehicle) {
        setForm({ ...initial, ...vehicle });
        setAlterado(false);
        const fotosSalvas = (vehicle as unknown as { fotos?: { id?: string; nome?: string; tipo?: string }[] }).fotos ?? [];
        const ids = fotosSalvas.map(foto => foto.id).filter((id): id is string => Boolean(id));
        void carregarFotosDoVeiculo(vehicle.id, ids).then(fotosDoBanco => {
          if (!ativo) return;
          const carregadas: Foto[] = fotosDoBanco.map((foto, index) => {
            const dados = fotosSalvas.find(item => item.id === foto.id);
            const file = new File([foto.blob], dados?.nome ?? `foto-${index + 1}.jpg`, { type: dados?.tipo ?? foto.blob.type });
            return { id: foto.id, file, url: URL.createObjectURL(foto.blob) };
          });
          fotosRef.current = carregadas;
          setFotos(carregadas);
        }).catch(() => undefined);
        return () => { ativo = false; };
      }
      const recebido = { marca: searchParams.get("marca") ?? "", modelo: searchParams.get("modelo") ?? "", placa: searchParams.get("placa") ?? "", anoFabricacao: searchParams.get("anoFabricacao") ?? "", anoModelo: searchParams.get("anoModelo") ?? "", km: searchParams.get("km") ?? "", valorVenda: searchParams.get("valorVenda") ?? "", status: searchParams.get("status") ?? "Cadastrado" };
      if (recebido.marca || recebido.modelo || recebido.placa) { setForm({ ...initial, ...recebido }); setAlterado(false); } else setError("Veículo não encontrado no estoque local.");
    } catch { setError("Não foi possível abrir o veículo para edição."); }
    return () => { ativo = false; };
  }, [editId]);
  function atualizarFotos(proximas: Foto[]) { fotosRef.current = proximas; setFotos(proximas); setAlterado(true); setDone(false); setAvisoSalvar(null); }
  function adicionarFotos(event: ChangeEvent<HTMLInputElement>) { const arquivos = Array.from(event.target.files ?? []); const aceitos = arquivos.filter(arquivo => arquivo.type.startsWith("image/") && arquivo.size <= 10 * 1024 * 1024).slice(0, Math.max(0, 20 - fotos.length)); atualizarFotos([...fotos, ...aceitos.map(file => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }))]); event.target.value = ""; }
  function removerFoto(id: string) { const foto = fotos.find(item => item.id === id); if (foto) URL.revokeObjectURL(foto.url); atualizarFotos(fotos.filter(item => item.id !== id)); }
  function alternarAcessorio(acessorio: string) { const selecionados = new Set(acessoriosSelecionados); if (selecionados.has(acessorio)) selecionados.delete(acessorio); else selecionados.add(acessorio); set("acessorios", Array.from(selecionados).join("|")); }
  function aplicarSugestaoAcessorios() {
    const sugeridos = sugerirAcessoriosPelaVersao([form.versao, form.modelo].filter(Boolean).join(" "));
    if (!sugeridos.length) { setError("Nenhum acessório identificável no texto da versão FIPE. Marque manualmente."); return; }
    const selecionados = new Set(acessoriosSelecionados);
    sugeridos.forEach(item => selecionados.add(item));
    set("acessorios", Array.from(selecionados).join("|"));
  }
  function imprimirCabide() {
    const escapar = escapeHtml;
    const loja = carregarDadosLoja();
    const linhas = [form.cabide1, form.cabide2, form.cabide3, form.cabide4, form.cabide5, form.cabide6].filter(Boolean);
    const tituloCurto = [form.marca, form.modelo].filter(Boolean).join(" ") || "Veículo";
    const subtitulo = [form.marca, form.modelo, form.versao, form.cor, [form.anoFabricacao, form.anoModelo].filter(Boolean).join("/")].filter(Boolean).join(" - ");
    const [precoInteiro, precoCentavos] = (form.valorVenda || "Consulte").split(",");
    const qr = (dados: string) => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(dados)}`;
    const qrSite = loja.site ? qr(loja.site) : null;
    const qrWhats = loja.whatsapp ? qr(`https://wa.me/${loja.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Tenho interesse no ${tituloCurto} - placa ${form.placa}`)}`) : null;
    const stat = (valor: string, label: string) => `<div class="stat"><p class="stat-valor">${escapar(valor || "-")}</p><p class="stat-label">${escapar(label)}</p></div>`;
    const html = `<!doctype html><html lang="pt-BR"><head><title>Cabide - ${escapar(tituloCurto)}</title><style>
@page{size:A4 portrait;margin:12mm}
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#0f172a;margin:0}
.cabide{display:flex;flex-direction:column;min-height:270mm;border:3px solid #0f172a;border-radius:12px;padding:24px}
.topo{font-size:11px;color:#64748b}
.cabecalho{display:flex;gap:24px;margin-top:14px}
.identidade{width:38%;display:flex;flex-direction:column;gap:10px}
.logo-box{height:100px;border:1px dashed #cbd5e1;border-radius:10px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.logo-box img{max-height:100%;max-width:100%;object-fit:contain}
.logo-box span{font-size:11px;color:#94a3b8}
.qrs{display:flex;gap:10px}
.qr{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:6px;text-align:center;font-size:10px;color:#64748b}
.qr img{width:100%;height:auto;display:block}
.principal{flex:1}
.titulo{font-size:30px;font-weight:800;margin:0}
.subtitulo{font-size:13px;color:#475569;margin-top:6px}
.preco{margin-top:20px;font-size:56px;font-weight:800;color:#166534}
.preco small{font-size:26px;font-weight:700}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0}
.stat-valor{margin:0;font-size:20px;font-weight:700}
.stat-label{margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
.opcionais{margin-top:24px;border:1px solid #e2e8f0;border-radius:10px;padding:16px;flex:1}
.opcionais h2{margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
.opcionais ul{margin:12px 0 0;padding:0;list-style:none;font-size:15px;line-height:1.9}
.rodape{margin-top:20px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#64748b}
</style></head><body><main class="cabide">
<div class="topo">${escapar(new Date().toLocaleString("pt-BR"))}</div>
<div class="cabecalho">
<div class="identidade">
<div class="logo-box">${loja.logo ? `<img src="${loja.logo}" alt="Logo"/>` : `<span>Logo da loja</span>`}</div>
<div class="qrs">
<div class="qr">${qrSite ? `<img src="${qrSite}" alt="QR do site"/>` : ""}<p>${qrSite ? "Ver no site" : "Configure o site em Configurações"}</p></div>
<div class="qr">${qrWhats ? `<img src="${qrWhats}" alt="QR do WhatsApp"/>` : ""}<p>${qrWhats ? "Falar no WhatsApp" : "Configure o WhatsApp em Configurações"}</p></div>
</div>
</div>
<div class="principal">
<h1 class="titulo">${escapar(tituloCurto)}</h1>
<p class="subtitulo">${escapar(subtitulo)}</p>
<p class="preco">R$ ${escapar(precoInteiro?.replace("R$", "").trim() ?? "Consulte")}${precoCentavos ? `<small>,${escapar(precoCentavos)}</small>` : ""}</p>
</div>
</div>
<div class="stats">
${stat([form.anoFabricacao, form.anoModelo].filter(Boolean).join("/"), "Ano")}
${stat(form.km ? `${form.km} km` : "", "Quilometragem")}
${stat(form.combustivel, "Combustível")}
${stat(form.garantia, "Garantia")}
</div>
<div class="opcionais"><h2>Opcionais</h2><ul>${linhas.length ? linhas.map(linha => `<li>• ${escapar(linha)}</li>`).join("") : `<li>-</li>`}</ul></div>
<div class="rodape"><span>${escapar([loja.nome, loja.site].filter(Boolean).join(" · ") || "Configure os dados da loja em Configurações")}</span><span>Placa ${escapar(form.placa || "-")}</span></div>
</main><script>window.onload=()=>window.print()</script></body></html>`;
    if (!imprimirHtml(html)) setError("O navegador bloqueou a janela de impressão. Libere os pop-ups e tente novamente.");
  }

  async function buscar() {
    const placa = form.placa.replace(/\W/g, "");
    if (placa.length !== 7) { setError("Digite uma placa válida com 7 caracteres."); return; }
    setLoading(true); setError(null); setDone(false); setAvisoSalvar(null); setOptions([]); setFipe(null);
    try {
      const response = await fetch(`/api/consulta-placa?placa=${placa}`);
      const json: { ok: boolean; data?: VehicleInfo; error?: string } = await response.json();
      if (!json.ok || !json.data) { setError(json.error ?? "Veículo não encontrado."); return; }
      const vehicle = json.data;
      setOptions(vehicle.fipe);
      setFipe(vehicle.fipe[0]?.valor ?? null);
      const modeloSugerido = family(vehicle.fipe[0]?.descricao ?? vehicle.modelo ?? "");
      setForm(old => ({ ...old, placa: plate(vehicle.placa || placa), marca: vehicle.marca ?? old.marca, modelo: modeloSugerido || old.modelo, versao: vehicle.fipe[0]?.descricao ?? vehicle.versao ?? old.versao, anoFabricacao: vehicle.ano ?? old.anoFabricacao, anoModelo: vehicle.anoModelo ?? old.anoModelo, cor: vehicle.cor ?? old.cor, combustivel: fuel(vehicle.combustivel) || old.combustivel, chassi: vehicle.chassi ?? old.chassi, renavam: vehicle.renavam ?? old.renavam, carroceria: vehicle.segmento ?? old.carroceria })); setAlterado(true);
      if (vehicle.marca) {
        const anoCatalogo = vehicle.anoModelo ?? vehicle.ano ?? "";
        void fetch(`/api/fipe-modelos?marca=${encodeURIComponent(vehicle.marca)}&ano=${encodeURIComponent(anoCatalogo)}`)
          .then(response => response.json())
          .then((catalogoJson: { ok: boolean; versoesPorModelo?: Record<string, string[]> }) => {
            if (catalogoJson.ok && catalogoJson.versoesPorModelo) setCatalog(catalogoJson.versoesPorModelo);
          })
          .catch(() => setCatalog({}));
      }
    } catch { setError("Falha de rede ao consultar a placa."); } finally { setLoading(false); }
  }

  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (!form.marca || !form.modelo || !form.km || !form.valorVenda) { const mensagem = "Preencha marca, modelo, quilometragem e valor de venda antes de salvar."; setError(mensagem); setAvisoSalvar(mensagem); return; }
    const records = JSON.parse(localStorage.getItem("garagem-pro-estoque") ?? "[]");
    const existing = records.find((item: { id: string }) => item.id === editId);
    const id = editId ?? crypto.randomUUID();
    const dadosDasFotos = fotos.length ? fotos.map(foto => ({ id: foto.id, nome: foto.file.name, tipo: foto.file.type, tamanho: foto.file.size })) : (existing?.fotos ?? []);
    try {
      await salvarFotosDoVeiculo(id, fotos);
    } catch {
      const mensagem = "Não foi possível salvar a foto neste navegador. Tente outra imagem menor.";
      setError(mensagem); setAvisoSalvar(mensagem); return;
    }
    const vehicle = { id, ...form, fotos: dadosDasFotos, criadoEm: existing?.criadoEm ?? new Date().toISOString() };
    const updated = editId && existing ? records.map((item: { id: string }) => item.id === editId ? vehicle : item) : [vehicle, ...records];
    localStorage.setItem("garagem-pro-estoque", JSON.stringify(updated));
    setError(null); setAvisoSalvar(null); setDone(true); setAlterado(false);
  }

  return <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
    <header className="mb-7 flex items-end justify-between"><div><p className="text-sm font-medium text-brand-600">Estoque</p><h1 className="mt-1 text-3xl font-bold text-slate-950">{editId ? "Editar veículo" : "Adicionar veículo"}</h1><p className="mt-1 text-sm text-slate-500">Consulte a placa para acelerar o preenchimento.</p></div><Link href="/estoque" className="text-sm font-semibold text-slate-600">← Estoque</Link></header>
    <form onSubmit={salvar} className="space-y-6">
      <section className="rounded-2xl border border-brand-100 bg-brand-50 p-5 sm:p-6"><p className="text-sm font-semibold text-slate-800">Buscar dados pela placa</p><p className="mt-1 text-xs text-slate-500">Depois da busca, escolha a versão correspondente na FIPE.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={form.placa} onChange={e => set("placa", plate(e.target.value))} placeholder="ABC-1234" className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold uppercase tracking-widest outline-none focus:border-brand-500"/><button type="button" onClick={buscar} disabled={loading} className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Buscando dados..." : "Buscar veículo"}</button></div>{fipe && <p className="mt-3 text-sm text-emerald-700">FIPE de referência: <strong>{fipe}</strong></p>}</section>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}{done && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{editId ? "Veículo atualizado" : "Veículo cadastrado"} neste navegador. <Link href="/estoque" className="font-semibold underline">Ver estoque</Link></p>}
      <Card title="Identificação do veículo"><Grid><Input label="Chassi" k="chassi" form={form} set={set}/><Input label="Renavam" k="renavam" form={form} set={set}/><Select label="Tipo" k="tipo" form={form} set={set} options={["Automóvel", "Motocicleta", "Caminhonete", "Caminhão"]}/><Select label="Novo ou usado" k="condicao" form={form} set={set} options={["Usado", "Novo"]}/></Grid></Card>
      <Card title="Dados do veículo"><Grid><Input label="Marca" k="marca" form={form} set={set} required/>{fipeModels.length ? <label className="text-xs font-semibold text-slate-600">Modelo (catálogo FIPE)<select value={form.modelo} onChange={e => { setAlterado(true); setDone(false); setAvisoSalvar(null); setForm(old => ({ ...old, modelo: e.target.value, versao: "" })); }} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"><option value="">Selecione o modelo</option>{fipeModels.map(model => <option key={model}>{model}</option>)}</select></label> : <Input label="Modelo" k="modelo" form={form} set={set} required/>}{versions.length ? <Select label="Versão (opções FIPE)" k="versao" form={form} set={set} options={versions}/> : <Input label="Versão" k="versao" form={form} set={set}/>}<Input label="Ano fabricação" k="anoFabricacao" form={form} set={set}/><Input label="Ano modelo" k="anoModelo" form={form} set={set}/></Grid></Card>
      <Card title="Características físicas"><Grid><Input label="Cor principal" k="cor" form={form} set={set}/><Select label="Combustível" k="combustivel" form={form} set={set} options={["", "Flex (Álcool / Gasolina)", "Gasolina", "Diesel", "Etanol", "Elétrico", "Híbrido", "GNV"]}/><Select label="Portas" k="portas" form={form} set={set} options={["2", "3", "4", "5"]}/><Input label="Carroceria" k="carroceria" form={form} set={set}/><Select label="Câmbio" k="cambio" form={form} set={set} options={["Manual", "Automático", "Automatizado", "CVT"]}/><Input label="Quilometragem" k="km" form={form} set={set} required placeholder="Ex.: 48.000"/></Grid></Card>
      <Card title="Anúncio"><Grid><Select label="Status do veículo" k="status" form={form} set={set} options={["Cadastrado", "Em preparação", "Anunciado", "Negociação", "Vendido"]}/><label className="text-xs font-semibold text-slate-600 sm:col-span-2">Descrição do veículo<textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} rows={4} placeholder="Opcional: descrição para o anúncio, diferenciais e acessórios." className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label></Grid></Card>
      <Card title="Garantia, estoque e valores"><Grid><Select label="Garantia" k="garantia" form={form} set={set} options={["Sem garantia", "3 meses", "6 meses", "12 meses"]}/><Select label="Tipo de estoque" k="tipoEstoque" form={form} set={set} options={["Próprio", "Consignado", "Repasse"]}/><Input label="Valor de compra" k="valorCompra" form={form} set={set} placeholder="R$ 0,00" currency/><div><Input label="Valor de venda" k="valorVenda" form={form} set={set} required placeholder="R$ 0,00" currency/>{fipe && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">Referência de mercado (FIPE): <strong>{fipe}</strong></p>}</div></Grid></Card>
      {editId && <Card title="Movimentações">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Entrada em estoque</h3>
          {entrada ? <>
            <div className="mt-3 grid gap-4 sm:grid-cols-3"><Info label="Tipo negociação" value={entrada.tipo}/><Info label="Responsável pela entrada" value={entrada.responsavelLoja}/><Info label="Valor de entrada" value={entrada.valor}/></div>
            <p className="mt-3 text-xs text-slate-500">Criado em {new Date(entrada.criadoEm).toLocaleString("pt-BR")}</p>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Negociação de entrada</h4><div className="mt-3 grid gap-4 sm:grid-cols-2"><Info label="Cliente" value={entradaCliente ?? "-"}/><Link href={`/negociacoes/${entrada.id}`} className="self-end text-sm font-semibold text-brand-600">Histórico →</Link></div></div>
          </> : <p className="mt-2 text-sm text-slate-500">Cadastrado manualmente no estoque{form.criadoEm ? ` em ${new Date(form.criadoEm).toLocaleDateString("pt-BR")}` : ""}, sem negociação de entrada vinculada.</p>}
        </div>
        {saidas.length > 0 && <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Saída / Venda</h3>
          {saidas.map(({ negociacao, clienteNome }) => <div key={negociacao.id} className="mt-3">
            <div className="grid gap-4 sm:grid-cols-3"><Info label="Responsável" value={negociacao.responsavelLoja}/><Info label="Valor de venda" value={negociacao.valor}/><Info label="Data" value={new Date(negociacao.criadoEm).toLocaleDateString("pt-BR")}/></div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2"><Info label="Cliente" value={clienteNome ?? "-"}/><Link href={`/negociacoes/${negociacao.id}`} className="self-end text-sm font-semibold text-brand-600">Histórico →</Link></div>
          </div>)}
        </div>}
      </Card>}
      <Card title="Acessórios">
        <p className="text-xs text-slate-500">A FIPE e a consulta de placa não trazem os acessórios do veículo — isso varia carro a carro. Marque manualmente ou use a sugestão abaixo, que lê o texto da versão FIPE e pré-marca itens comuns (ex.: câmbio automático, bancos de couro, teto solar).</p>
        <button type="button" onClick={aplicarSugestaoAcessorios} className="mt-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">Sugerir pela versão FIPE</button>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">{acessoriosDisponiveis.map(item => <label key={item} className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={acessoriosSelecionados.includes(item)} onChange={() => alternarAcessorio(item)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"/>{item}</label>)}</div>
      </Card>
      <Card title="Cabide (ficha para o para-brisa)">
        <p className="text-xs text-slate-500">Ficha impressa para pendurar no para-brisa do carro. Preencha até 6 informações (ex.: destaques, opcionais, condições de pagamento) e clique em imprimir.</p>
        <Grid><Input label="Opcional 1" k="cabide1" form={form} set={set}/><Input label="Opcional 2" k="cabide2" form={form} set={set}/><Input label="Opcional 3" k="cabide3" form={form} set={set}/><Input label="Opcional 4" k="cabide4" form={form} set={set}/><Input label="Opcional 5" k="cabide5" form={form} set={set}/><Input label="Opcional 6" k="cabide6" form={form} set={set}/></Grid>
        <button type="button" onClick={imprimirCabide} className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Imprimir cabide</button>
      </Card>
      <Card id="fotos" title="Fotos do veículo"><div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4"><label className="flex cursor-pointer flex-col items-center justify-center rounded-lg px-4 py-7 text-center hover:bg-white"><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={adicionarFotos}/><span className="text-2xl text-brand-600">⌑</span><span className="mt-2 text-sm font-semibold text-slate-700">Adicionar fotos</span><span className="mt-1 text-xs text-slate-500">JPG, PNG ou WebP · até 10 MB por foto · máximo de 20 fotos</span></label></div><p className="mt-3 text-xs text-slate-500">Ao salvar, as fotos ficam guardadas neste navegador e a primeira aparece no estoque.</p>{fotos.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{fotos.map((foto, index) => <div key={foto.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><img src={foto.url} alt={`Foto ${index + 1} do veículo`} className="aspect-[4/3] h-full w-full object-cover"/><span className="absolute left-2 top-2 rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">{index + 1}</span><button type="button" onClick={() => removerFoto(foto.id)} className="absolute right-2 top-2 rounded bg-white/95 px-2 py-1 text-xs font-semibold text-red-600 shadow opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">Remover</button></div>)}</div>}</Card>
      <Card title="Documentos"><label className="block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-sm text-slate-500"><input type="file" accept="image/*,.pdf" className="sr-only"/>↥ Adicionar CRLV (imagem ou PDF)</label></Card>
      {alterado && <div className="sticky bottom-3 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg"><p className="mr-auto text-xs font-medium text-amber-700">{avisoSalvar ?? "Você possui alterações não salvas."}</p><Link href="/estoque" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</Link><button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">{editId ? "Salvar alterações" : "Adicionar veículo"}</button></div>}
    </form>
  </div>;
}
function Card({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) { return <section id={id} className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">{title}</h2><div className="mt-5">{children}</div></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-slate-800">{value || "-"}</p></div>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2">{children}</div>; }
function Input({ label, k, form, set, required, placeholder, currency }: { label: string; k: string; form: Form; set: (k: string, v: string) => void; required?: boolean; placeholder?: string; currency?: boolean }) { return <label className="text-xs font-semibold text-slate-600">{label}{required && <span className="text-red-500"> *</span>}<input value={form[k]} required={required} onChange={e => set(k, e.target.value)} onBlur={() => currency && set(k, money(form[k]))} placeholder={placeholder} inputMode={currency ? "decimal" : undefined} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"/></label>; }
function Select({ label, k, form, set, options }: { label: string; k: string; form: Form; set: (k: string, v: string) => void; options: string[] }) { return <label className="text-xs font-semibold text-slate-600">{label}<select value={form[k]} onChange={e => set(k, e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">{options.map(option => <option key={option}>{option}</option>)}</select></label>; }
