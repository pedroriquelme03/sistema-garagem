"use client";

import { useLojaUi } from "@/components/loja/LojaUi";

export default function BotaoContato({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const { abrirContato } = useLojaUi();
  return (
    <button type="button" onClick={abrirContato} className={className}>
      {children}
    </button>
  );
}
