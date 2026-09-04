import Link from "next/link";

export default function LojaNaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-950">Veículo indisponível</h1>
      <p className="mt-2 text-sm text-slate-500">Ele pode ter sido vendido ou ainda não foi publicado.</p>
      <Link href="/loja" className="mt-6 inline-block text-sm font-semibold text-brand-600">Ver estoque da loja →</Link>
    </div>
  );
}
