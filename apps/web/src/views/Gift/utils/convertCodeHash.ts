import { encodePacked, keccak256 } from 'viem'

export const convertCodeHash = (code?: string) => {
  // Code is 20 characters long
  if (!code || code.length !== 20) {
    return undefined
  }

  return keccak256(encodePacked(['string'], [code]))
}
