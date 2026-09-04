"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const items = [
  ["/", "Visão geral", "⌂"],
  ["/estoque", "Estoque", "▱"],
  ["/consultar-placa", "Consultar placa", "⌕"],
  ["/clientes", "Clientes", "♙"],
  ["/negociacoes", "Negociações", "▤"],
  ["/simulacoes", "Financiamento", "％"],
  ["/relatorios", "Relatórios", "⌁"],
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed left-4 top-4 z-40 rounded-lg bg-slate-950 p-2 text-white md:hidden" aria-label="Abrir menu">☰</button>
      {open && <button onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" aria-label="Fechar menu" />}
      <aside className={`fixed z-30 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">G</span>
          <div>
            <p className="font-semibold text-white">Garagem Pro</p>
            <p className="text-xs text-slate-500">Começa pela placa</p>
          </div>
        </Link>
        <nav className="flex-1 px-3 py-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Operação</p>
          {items.map(([href, label, icon]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? "bg-brand-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <span className="w-5 text-center">{icon}</span>{label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
          <p className="font-medium text-slate-300">Site da loja</p>
          <p className="mt-1 leading-5 text-slate-500">As fotos do estoque sobem sozinhas para a vitrine.</p>
          <Link href="/loja" target="_blank" onClick={() => setOpen(false)} className="mt-2 inline-block font-semibold text-brand-400 hover:text-white">Ver /loja →</Link>
        </div>
        <Link href="/configuracoes" onClick={() => setOpen(false)} className="border-t border-slate-800 px-6 py-4 text-sm text-slate-500 hover:text-white">⚙ Configurações</Link>
      </aside>
    </>
  );
}
