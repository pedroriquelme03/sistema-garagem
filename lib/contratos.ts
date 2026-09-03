import { escapeHtml } from "@/lib/imprimir";
import type { Cliente } from "@/lib/clientes";
import type { DadosLoja } from "@/lib/loja";
import type { Negociacao } from "@/lib/negociacoes";
import type { Veiculo } from "@/lib/veiculos";

function tituloContrato(tipo: Negociacao["tipo"]): string {
  if (tipo === "Venda") return "Contrato de Compra e Venda de Veículo Usado";
  if (tipo === "Compra") return "Contrato de Compra de Veículo";
  if (tipo === "Consignação") return "Contrato de Consignação de Veículo";
  return "Contrato de Troca de Veículo";
}

function papelCliente(tipo: Negociacao["tipo"]): string {
  if (tipo === "Venda") return "COMPRADOR(A)";
  if (tipo === "Consignação") return "CONSIGNANTE";
  return "VENDEDOR(A)";
}

function clausulaObjeto(tipo: Negociacao["tipo"]): string {
  if (tipo === "Venda") return "A LOJA vende, e o(a) COMPRADOR(A) compra, o veículo descrito acima, no estado em que se encontra, mediante o pagamento do valor e condições abaixo.";
  if (tipo === "Consignação") return "O(A) CONSIGNANTE entrega o veículo descrito acima à LOJA para fins de venda por conta e ordem do(a) CONSIGNANTE, mediante as condições de repasse combinadas entre as partes.";
  if (tipo === "Troca") return "O(A) VENDEDOR(A) entrega o veículo descrito acima à LOJA como parte de pagamento de outra negociação, pelo valor de avaliação abaixo.";
  return "A LOJA compra, e o(a) VENDEDOR(A) vende, o veículo descrito acima, no estado em que se encontra, mediante o pagamento do valor abaixo.";
}

function nomeCliente(cliente: Cliente): string {
  return cliente.nome || "-";
}

function enderecoCliente(cliente: Cliente): string {
  return [cliente.endereco, cliente.numero, cliente.bairro, [cliente.municipio, cliente.uf].filter(Boolean).join("/")].filter(Boolean).join(", ") || "Endereço não informado";
}

export function gerarContratoHtml(negociacao: Negociacao, veiculo: Veiculo, cliente: Cliente, loja: DadosLoja): string {
  const e = escapeHtml;
  const titulo = tituloContrato(negociacao.tipo);
  const papel = papelCliente(negociacao.tipo);
  const veiculoResumo = [veiculo.marca, veiculo.modelo, veiculo.versao].filter(Boolean).join(" ") || "Veículo";
  const linhasPagamento = negociacao.pagamentos.length
    ? negociacao.pagamentos.map(item => `<li>${e(item.forma)}${item.banco ? ` (${e(item.banco)})` : ""}: ${e(item.valor || "-")}</li>`).join("")
    : `<li>${e(negociacao.valor || "-")}</li>`;
  return `<!doctype html><html lang="pt-BR"><head><title>${e(titulo)}</title><style>
@page{size:A4 portrait;margin:16mm}
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;color:#0f172a;margin:0;font-size:13px;line-height:1.6}
h1{font-size:19px;text-align:center;margin:0 0 4px}
.subtitulo{text-align:center;color:#64748b;font-size:11px;margin:0 0 22px}
.partes{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
.parte{border:1px solid #e2e8f0;border-radius:10px;padding:12px}
.parte h2{margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
.parte p{margin:2px 0}
.veiculo{border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin-bottom:18px}
.veiculo h2{margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#64748b}
.veiculo-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 16px}
.clausula{margin:14px 0}
.clausula h2{font-size:12px;margin:0 0 6px}
.clausula p, .clausula ul{margin:0}
.clausula ul{padding-left:18px}
.assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:60px}
.assinatura{border-top:1px solid #0f172a;padding-top:6px;text-align:center;font-size:11px;color:#475569}
.rodape{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8}
</style></head><body>
<h1>${e(titulo)}</h1>
<p class="subtitulo">${e(new Date().toLocaleString("pt-BR"))}</p>
<div class="partes">
<div class="parte"><h2>Loja</h2><p><strong>${e(loja.nome || "Loja não configurada")}</strong></p><p>${e(loja.site || "")}</p><p>${e(loja.whatsapp || "")}</p></div>
<div class="parte"><h2>${e(papel)}</h2><p><strong>${e(nomeCliente(cliente))}</strong></p><p>${e(cliente.documento || "-")}</p><p>${e(cliente.telefone || "-")}</p><p>${e(enderecoCliente(cliente))}</p></div>
</div>
<div class="veiculo"><h2>Veículo</h2><div class="veiculo-grid">
<p><strong>${e(veiculoResumo)}</strong></p>
<p>Placa: ${e(veiculo.placa || "-")}</p>
<p>Cor: ${e(veiculo.cor || "-")}</p>
<p>Ano: ${e([veiculo.anoFabricacao, veiculo.anoModelo].filter(Boolean).join("/") || "-")}</p>
<p>Km: ${e(veiculo.km || "-")}</p>
<p>Chassi: ${e(veiculo.chassi || "-")}</p>
</div></div>
<div class="clausula"><h2>1. Objeto</h2><p>${e(clausulaObjeto(negociacao.tipo))}</p></div>
<div class="clausula"><h2>2. Valor e forma de pagamento</h2><p>Valor total: <strong>${e(negociacao.valor || "-")}</strong></p><ul>${linhasPagamento}</ul></div>
<div class="clausula"><h2>3. Responsável pela negociação</h2><p>${e(negociacao.responsavelLoja || "-")}, em nome da loja.</p></div>
<div class="clausula"><h2>4. Disposições gerais</h2><p>As partes declaram estar de acordo com as condições descritas neste contrato, firmando-o livremente.</p></div>
<div class="assinaturas">
<div class="assinatura">${e(loja.nome || "Loja")}</div>
<div class="assinatura">${e(nomeCliente(cliente))}</div>
</div>
<p class="rodape">Contrato gerado automaticamente pelo sistema — revise os dados antes de assinar.</p>
</body></html>`;
}
