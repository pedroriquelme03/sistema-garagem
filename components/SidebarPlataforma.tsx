"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAcesso } from "@/components/AcessoProvider";

function Menu({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sessao, sair } = useAcesso();
  return (
    <>
      <Link href="/plataforma" onClick={onNavigate} className="flex items-center gap-3 px-5 py-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">P</span>
        <div>
          <p className="font-semibold text-white">Plataforma</p>
          <p className="text-xs text-slate-500">Garagem Pro</p>
        </div>
      </Link>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <Link href="/plataforma" onClick={onNavigate} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === "/plataforma" ? "bg-brand-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
          Assinantes
        </Link>
        <Link href="/plataforma/planos" onClick={onNavigate} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname.startsWith("/plataforma/planos") ? "bg-brand-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
          Planos
        </Link>
      </nav>
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="truncate text-sm font-medium text-slate-200">{sessao?.usuario.nome}</p>
        <p className="truncate text-xs text-slate-500">{sessao?.usuario.email}</p>
        <button type="button" onClick={() => void sair()} className="mt-3 text-xs font-semibold text-slate-400 hover:text-white">Sair</button>
      </div>
    </>
  );
}

export default function SidebarPlataforma() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(v => !v)} className="fixed left-4 top-4 z-40 rounded-lg bg-slate-950 p-2 text-white md:hidden" aria-label="Abrir menu">☰</button>
      {open ? <button onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" aria-label="Fechar menu" /> : null}
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Menu onNavigate={() => setOpen(false)} />
      </aside>
      <div className="hidden w-64 shrink-0 bg-slate-950 md:block">
        <aside className="sticky top-0 flex h-dvh flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
          <Menu />
        </aside>
      </div>
    </>
  );
}
