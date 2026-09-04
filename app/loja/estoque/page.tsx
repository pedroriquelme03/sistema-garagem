import { Suspense } from "react";
import EstoqueExplorer from "@/components/loja/EstoqueExplorer";
import { listarEstoquePublico } from "@/lib/estoque-publico";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const estoque = await listarEstoquePublico();
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-sm text-patio-mute">Carregando estoque...</div>}>
      <EstoqueExplorer veiculos={estoque.veiculos} />
    </Suspense>
  );
}
