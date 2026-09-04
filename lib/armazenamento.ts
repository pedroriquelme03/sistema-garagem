let lojaId = "";

export function definirLojaAtual(id: string | null | undefined) {
  lojaId = id?.trim() ?? "";
}

export function lojaAtualId() {
  return lojaId;
}

export function lerStorage<T>(base: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const chaves = lojaId ? [`${base}:${lojaId}`, base] : [base];
  for (const chave of chaves) {
    const bruto = localStorage.getItem(chave);
    if (!bruto) continue;
    try {
      return JSON.parse(bruto) as T;
    } catch {
      /* tenta a próxima */
    }
  }
  return fallback;
}

export function gravarStorage(base: string, valor: unknown) {
  if (typeof window === "undefined") return;
  const chave = lojaId ? `${base}:${lojaId}` : base;
  localStorage.setItem(chave, JSON.stringify(valor));
}
