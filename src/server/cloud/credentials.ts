import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

function keyFromEnvironment(): Buffer {
  const raw = process.env.CLOUD_CREDENTIALS_KEY;
  if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) throw new Error("Set CLOUD_CREDENTIALS_KEY to a 64-character hexadecimal key.");
  return Buffer.from(raw, "hex");
}

export function sealCloudCredential(plaintext: string): string {
  if (!plaintext) throw new Error("Credential cannot be empty.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromEnvironment(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function unsealCloudCredential(sealed: string): string {
  const parts = sealed.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted credential format.");
  const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, "base64url"));
  if (iv.length !== 12 || tag.length !== 16 || encrypted.length === 0) throw new Error("Invalid encrypted credential format.");
  const decipher = createDecipheriv("aes-256-gcm", keyFromEnvironment(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
