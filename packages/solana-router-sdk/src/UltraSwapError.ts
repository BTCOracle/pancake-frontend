export enum UltraSwapErrorType {
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  WALLET_SIGNING_FAILED = 'WALLET_SIGNING_FAILED',
}

export class UltraSwapError extends Error {
  type: UltraSwapErrorType

  txid?: string

  constructor(message: string, type: UltraSwapErrorType, txid?: string) {
    super(message)
    this.type = type
    this.txid = txid
  }
}
