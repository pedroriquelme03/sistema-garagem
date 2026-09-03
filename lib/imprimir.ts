export function escapeHtml(valor: string): string {
  return valor.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function imprimirHtml(html: string, opts?: { width?: number; height?: number }): boolean {
  const popup = window.open("", "_blank", `width=${opts?.width ?? 820},height=${opts?.height ?? 1080}`);
  if (!popup) return false;
  popup.document.write(html);
  popup.document.close();
  return true;
}
