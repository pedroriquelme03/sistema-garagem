import { Suspense } from "react";
import EstoqueExplorer from "@/components/loja/EstoqueExplorer";
import { carregarLojaPublica, listarEstoquePublico } from "@/lib/estoque-publico";
import { nivelVitrine } from "@/lib/loja-publico";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const [loja, estoque] = await Promise.all([carregarLojaPublica(), listarEstoquePublico()]);
  const nivel = nivelVitrine(loja);
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-patio-mute">Carregando estoque...</div>}>
      <EstoqueExplorer
        veiculos={estoque.veiculos}
        variante={nivel === "master" ? "showroom" : nivel === "pro" ? "lote" : "patio"}
      />
    </Suspense>
  );
}
