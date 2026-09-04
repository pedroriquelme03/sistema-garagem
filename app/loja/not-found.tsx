import Link from "next/link";

export default function LojaNaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="rounded-2xl bg-patio-paper px-8 py-12 text-patio-ink ring-1 ring-white/10">
        <h1 className="font-display text-3xl">Esse carro já saiu do pátio</h1>
        <p className="mt-3 text-sm text-patio-mute">Pode ter sido vendido ou ainda não foi publicado na vitrine.</p>
        <Link href="/loja/estoque" className="mt-6 inline-block text-sm font-semibold text-patio-cobalt">Ver estoque →</Link>
      </div>
    </div>
  );
}
