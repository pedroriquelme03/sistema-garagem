export async function registrarRenaveAutomatico(placa: string | undefined, evento: "entrada" | "saida") {
  const limpa = (placa ?? "").replace(/[^A-Za-z0-9]/g, "");
  if (limpa.length !== 7) return null;
  const resposta = await fetch("/api/renave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evento, placa: limpa }),
  });
  const dados = await resposta.json().catch(() => null) as { registrado?: boolean; motivo?: string | null } | null;
  if (!resposta.ok || !dados) return null;
  return dados;
}
