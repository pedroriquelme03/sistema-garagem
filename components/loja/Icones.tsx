export function MarcaGaragem({
  nome,
  tom = "escuro",
}: {
  nome: string;
  tom?: "escuro" | "claro";
}) {
  const claro = tom === "claro";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`grid h-9 w-[2.65rem] place-items-center rounded-[6px] border-[2.5px] font-display text-[10px] font-bold tracking-[0.14em] ${claro ? "border-white text-white" : "border-patio-ink bg-patio-cream text-patio-ink"}`}>
        GP
      </span>
      <span className={`font-display text-[1.15rem] font-semibold tracking-tight ${claro ? "text-white" : "text-patio-ink"}`}>{nome}</span>
    </span>
  );
}

export function IconeInstagram({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconeFacebook({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14.2 21v-7.3h2.5l.4-2.9h-2.9V8.9c0-.8.2-1.4 1.4-1.4h1.6V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8.6v2.9h2.5V21h3.1Z" />
    </svg>
  );
}

export function IconeWhatsapp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2.5A9.5 9.5 0 0 0 3.3 16.1L2 22l6.05-1.25A9.5 9.5 0 1 0 12.04 2.5Zm0 17.4a7.9 7.9 0 0 1-4.03-1.1l-.29-.17-3.59.74.76-3.5-.19-.3a7.9 7.9 0 1 1 7.34 4.33Zm4.33-5.92c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.91-1.18-.7-.63-1.18-1.4-1.32-1.64-.14-.24-.01-.37.1-.49.11-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
