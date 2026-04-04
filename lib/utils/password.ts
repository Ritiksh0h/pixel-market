const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const DIGEST = "SHA-512";

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
  const hash = Buffer.from(derivedBits).toString("hex");
  const saltHex = Buffer.from(salt).toString("hex");
  return `${saltHex}:${hash}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hash] = storedHash.split(":");
  if (!saltHex || !hash) return false;

  const salt = Buffer.from(saltHex, "hex");
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: DIGEST,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );
  const derivedHash = Buffer.from(derivedBits).toString("hex");
  return derivedHash === hash;
}
