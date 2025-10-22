import { base64url, jwtDecrypt } from 'jose'

import { memoizeOne } from './libs/async-memoize-one'

export type JsonValue = any

export type FlagOverridesType = Record<string, JsonValue>

type PurposeClaim = 'overrides' | 'values' | 'definitions' | 'proof'
type Purpose = string | string[]

/**
 * Checks if a purpose claim matches the expected purpose.
 *
 * @param pur - The purpose claim to check, can be a string or array of strings
 * @param expectedPurpose - The expected purpose to match against
 * @returns True if the purpose matches the expected purpose, false otherwise
 */
const hasPurpose = (pur: Purpose, expectedPurpose: PurposeClaim): boolean => {
  return Array.isArray(pur) ? pur.includes(expectedPurpose) : pur === expectedPurpose
}

const memoizedDecrypt = memoizeOne(
  (text: string) => decryptOverrides(text),
  (a, b) => a[0] === b[0], // only the first argument gets compared
  { cachePromiseRejection: true },
)

/**
 * Decrypts a JWE token and verifies its contents.
 *
 * @param text - The encrypted JWE token string
 * @param verify - A function to verify the decrypted payload is valid
 * @param secret - The decryption secret (must be a 256-bit key)
 * @returns A promise resolving to the decrypted data or undefined if invalid
 * @throws Error if the secret is invalid
 */
async function decryptJwe<T extends string | object = Record<string, unknown>>(
  text: string,
  verify: (payload: T) => boolean,
  secret: string,
): Promise<T | undefined> {
  if (typeof text !== 'string') return undefined

  const encodedSecret = base64url.decode(secret)

  if (encodedSecret.length !== 32) {
    throw new Error('flags: Invalid secret, it must be a 256-bit key (32 bytes)')
  }

  try {
    const { payload } = await jwtDecrypt(text, encodedSecret)
    const decoded = payload as T
    return verify(decoded) ? decoded : undefined
  } catch {
    return undefined
  }
}

/**
 * Decrypts and validates flag overrides data.
 *
 * @param encryptedData - The encrypted JWE token string
 * @param secret - The decryption secret (defaults to FLAGS_SECRET env var)
 * @returns A promise resolving to the decrypted flag overrides or undefined if invalid
 * @throws Error if the secret is missing or invalid
 */
export async function decryptOverrides(
  encryptedData: string,
  secret: string | undefined = process?.env?.FLAGS_SECRET,
): Promise<FlagOverridesType | undefined> {
  if (!secret) throw new Error('flags: Missing FLAGS_SECRET')
  const contents = await decryptJwe<{
    o: FlagOverridesType
    pur: Purpose
  }>(encryptedData, (data) => hasPurpose(data.pur, 'overrides') && Object.hasOwn(data, 'o'), secret)
  return contents?.o
}

export async function getOverrides(cookie: string | undefined) {
  if (typeof cookie === 'string' && cookie !== '') {
    const cookieOverrides = await memoizedDecrypt(cookie)
    return cookieOverrides ?? null
  }

  return null
}
