"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAcesso } from "@/components/AcessoProvider";
import { SeloCadeado } from "@/components/FaixaUpgrade";
import { formatarPrecoPlano, labelDoPlano, temRecurso } from "@/lib/acesso/tipos";

const todos = [
  ["/", "Visão geral", "⌂"],
  ["/estoque", "Estoque", "▱"],
  ["/consultar-placa", "Consultar placa", "⌕"],
  ["/clientes", "Clientes", "♙"],
  ["/negociacoes", "Negociações", "▤"],
  ["/integracoes", "Integrações", "⧉"],
  ["/simulacoes", "Financiamento", "％"],
  ["/relatorios", "Relatórios", "⌁"],
];

function MenuLateral({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { sessao, sair, voltarPlataforma } = useAcesso();
  const vendedor = sessao?.usuario.papel === "vendedor";
  const essencial = sessao?.loja?.plano === "essencial";
  const comFipe = temRecurso(sessao?.loja, "fipe");
  const siteMaster = temRecurso(sessao?.loja, "site-master");
  return (
    <>
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-5 py-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 font-bold text-white">G</span>
        <div>
          <p className="font-semibold text-white">Garagem Pro</p>
          <p className="text-xs text-slate-500">{sessao?.loja ? sessao.loja.nome : "Começa pela placa"}</p>
          {sessao?.loja ? (
            <p className="mt-0.5 text-[11px] font-semibold text-brand-400">
              {sessao.loja.planoLabel || labelDoPlano(sessao.loja.plano)}
              {sessao.loja.planoPreco ? ` · ${formatarPrecoPlano(sessao.loja.planoPreco)}/mês` : ""}
            </p>
          ) : null}
        </div>
      </Link>
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">Operação</p>
        {todos.map(([href, label, icon]) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onNavigate} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? "bg-brand-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <span className="w-5 text-center">{icon}</span>
              <span className="flex-1">{label}</span>
              {href === "/consultar-placa" && !comFipe ? <SeloCadeado plano="Pro" ativo={active} /> : null}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs">
        <p className="font-medium text-slate-300">Site da loja</p>
        <p className="mt-1 leading-5 text-slate-500">
          {essencial
            ? "Vitrine simples. Destaque, marcas e temas estão com cadeado no Pro."
            : siteMaster
              ? "As fotos do estoque sobem sozinhas para a vitrine."
              : "Site completo do Pro. Identidade 100% da loja está com cadeado no Master."}
        </p>
        <Link href="/loja" target="_blank" onClick={onNavigate} className="mt-2 inline-block font-semibold text-brand-400 hover:text-white">Ver /loja →</Link>
      </div>
      {vendedor ? null : (
        <Link href="/configuracoes" onClick={onNavigate} className="border-t border-slate-800 px-6 py-4 text-sm text-slate-500 hover:text-white">⚙ Configurações</Link>
      )}
      <div className="border-t border-slate-800 px-5 py-4">
        <p className="truncate text-sm font-medium text-slate-200">{sessao?.usuario.nome}</p>
        <p className="truncate text-xs text-slate-500">
          {sessao?.usuario.papel === "plataforma" ? "Plataforma na loja" : sessao?.usuario.papel === "admin" ? "Admin da loja" : "Vendedor"}
        </p>
        {sessao?.impersonando ? (
          <button type="button" onClick={() => void voltarPlataforma()} className="mt-3 block text-xs font-semibold text-brand-400 hover:text-white">Voltar à plataforma</button>
        ) : null}
        <button type="button" onClick={() => void sair()} className="mt-2 text-xs font-semibold text-slate-400 hover:text-white">Sair</button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(aberto => !aberto)} className="fixed left-4 top-4 z-40 rounded-lg bg-slate-950 p-2 text-white md:hidden" aria-label="Abrir menu">☰</button>
      {open ? <button onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 md:hidden" aria-label="Fechar menu" /> : null}

      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform md:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <MenuLateral onNavigate={() => setOpen(false)} />
      </aside>

      <div className="hidden w-64 shrink-0 bg-slate-950 md:block">
        <aside className="sticky top-0 flex h-dvh flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
          <MenuLateral />
        </aside>
      </div>
    </>
  );
}
