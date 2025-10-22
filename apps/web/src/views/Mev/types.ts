export interface PageProps {
  txCount: number
  walletCount: number
}

export interface RPCResponse {
  id: number
  jsonrpc: string
  result: number
}

export enum WalletType {
  mevNotSupported,
  mevDefaultOnBSC,
  mevOnlyManualConfig,
  nativeSupportCustomRPC,
}
