export type FotoParaSalvar = {
  id: string;
  file: File;
};

type FotoSalva = {
  id: string;
  veiculoId: string;
  blob: Blob;
};

const banco = "garagem-pro-fotos";
const tabela = "fotos";

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(banco, 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(tabela)) request.result.createObjectStore(tabela, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
  });
}

export async function salvarFotosDoVeiculo(veiculoId: string, fotos: FotoParaSalvar[]) {
  if (!fotos.length) return;
  const db = await abrirBanco();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(tabela, "readwrite");
    const store = transaction.objectStore(tabela);
    fotos.forEach(foto => store.put({ id: `${veiculoId}:${foto.id}`, veiculoId, blob: foto.file } satisfies FotoSalva));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function carregarPrimeiraFoto(veiculoId: string, fotoId?: string) {
  if (!fotoId) return null;
  const db = await abrirBanco();
  const resultado = await new Promise<FotoSalva | undefined>((resolve, reject) => {
    const request = db.transaction(tabela, "readonly").objectStore(tabela).get(`${veiculoId}:${fotoId}`);
    request.onsuccess = () => resolve(request.result as FotoSalva | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return resultado?.blob ? URL.createObjectURL(resultado.blob) : null;
}

export async function excluirFotosDoVeiculo(veiculoId: string, fotoIds: string[]) {
  if (!fotoIds.length) return;
  const db = await abrirBanco();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(tabela, "readwrite");
    const store = transaction.objectStore(tabela);
    fotoIds.forEach(fotoId => store.delete(`${veiculoId}:${fotoId}`));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function carregarFotosDoVeiculo(veiculoId: string, fotoIds: string[]) {
  if (!fotoIds.length) return [];
  const db = await abrirBanco();
  const resultado = await Promise.all(fotoIds.map(fotoId => new Promise<{ id: string; blob: Blob } | null>((resolve, reject) => {
    const request = db.transaction(tabela, "readonly").objectStore(tabela).get(`${veiculoId}:${fotoId}`);
    request.onsuccess = () => {
      const foto = request.result as FotoSalva | undefined;
      resolve(foto?.blob ? { id: fotoId, blob: foto.blob } : null);
    };
    request.onerror = () => reject(request.error);
  })));
  db.close();
  return resultado.filter((foto): foto is { id: string; blob: Blob } => Boolean(foto));
}
