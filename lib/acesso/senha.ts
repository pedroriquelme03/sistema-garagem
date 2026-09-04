import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashSenha(senha: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(senha, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function senhaBate(senha: string, gravado: string) {
  const [saltHex, hashHex] = gravado.split(":");
  if (!saltHex || !hashHex) return false;
  const hash = scryptSync(senha, Buffer.from(saltHex, "hex"), 32);
  const esperado = Buffer.from(hashHex, "hex");
  if (esperado.length !== hash.length) return false;
  return timingSafeEqual(esperado, hash);
}

export function emailOk(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function senhaOk(senha: string) {
  return senha.trim().length >= 8;
}
