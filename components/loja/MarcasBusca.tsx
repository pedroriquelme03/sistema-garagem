"use client";

import { useMemo } from "react";
import CarrosselMarcas from "@/components/loja/CarrosselMarcas";
import { marcasDoEstoque } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export default function MarcasBusca({ veiculos }: { veiculos: VeiculoVitrine[] }) {
  const marcas = useMemo(() => marcasDoEstoque(veiculos), [veiculos]);
  if (!marcas.length) return null;
  return (
    <section className="bg-patio-night py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <CarrosselMarcas marcas={marcas} />
      </div>
    </section>
  );
}
