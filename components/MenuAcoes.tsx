"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const LARGURA = 192;

export default function MenuAcoes({ label, children }: { label: string; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function posicionar() {
    const botao = botaoRef.current;
    const menu = menuRef.current;
    if (!botao) return;
    const rect = botao.getBoundingClientRect();
    const altura = menu?.offsetHeight ?? 220;
    const cabeAbaixo = rect.bottom + 4 + altura <= window.innerHeight - 8;
    const top = cabeAbaixo ? rect.bottom + 4 : Math.max(8, rect.top - altura - 4);
    const left = Math.min(Math.max(8, rect.right - LARGURA), window.innerWidth - LARGURA - 8);
    setPos({ top, left });
  }

  useLayoutEffect(() => {
    if (aberto) posicionar();
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    function fora(event: MouseEvent) {
      const alvo = event.target as Node;
      if (botaoRef.current?.contains(alvo) || menuRef.current?.contains(alvo)) return;
      setAberto(false);
    }
    function tecla(event: KeyboardEvent) {
      if (event.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    window.addEventListener("resize", posicionar);
    window.addEventListener("scroll", posicionar, true);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("resize", posicionar);
      window.removeEventListener("scroll", posicionar, true);
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        ref={botaoRef}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={label}
        onClick={() => {
          if (aberto) {
            setAberto(false);
            return;
          }
          const rect = botaoRef.current?.getBoundingClientRect();
          if (rect) {
            setPos({
              top: rect.bottom + 4,
              left: Math.min(Math.max(8, rect.right - LARGURA), window.innerWidth - LARGURA - 8),
            });
          }
          setAberto(true);
        }}
        className="rounded-lg px-2 py-1 text-xl font-bold leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        •••
      </button>
      {aberto
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: pos.top, left: pos.left, width: LARGURA }}
              className="fixed z-50 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg"
              onClick={() => setAberto(false)}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
