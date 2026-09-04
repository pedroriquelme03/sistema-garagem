"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SidebarPlataforma from "@/components/SidebarPlataforma";
import { useAcesso } from "@/components/AcessoProvider";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sessao, voltarPlataforma } = useAcesso();

  if (pathname.startsWith("/loja") || pathname === "/entrar" || pathname.startsWith("/entrar/")) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  if (pathname.startsWith("/plataforma")) {
    return (
      <div className="flex min-h-dvh">
        <SidebarPlataforma />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1">
        {sessao?.impersonando && sessao.loja ? (
          <div className="flex items-center justify-between gap-3 bg-slate-900 px-4 py-2.5 text-xs text-slate-200 sm:px-6">
            <p>Você está na loja <strong className="text-white">{sessao.loja.nome}</strong> como plataforma.</p>
            <button type="button" onClick={() => void voltarPlataforma()} className="font-semibold text-brand-300 hover:text-white">Voltar à plataforma</button>
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
