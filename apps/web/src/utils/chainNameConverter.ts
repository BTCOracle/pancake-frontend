import { MultiChainNameExtend } from 'state/info/constant'
import { bsc, bscTestnet, linea } from 'wagmi/chains'

export const chainNameConverter = (name: string) => {
  switch (name) {
    case bsc.name:
      return 'BNB Chain'
    case linea.name:
      return 'Linea'
    case bscTestnet.name:
      return 'BNB Chain Testnet'
    case 'solana':
    case 'sol':
      return 'Solana'
    default:
      return name
  }
}

export const multiChainNameConverter = (name: MultiChainNameExtend) => {
  switch (name) {
    case 'BSC':
      return 'BNB Chain'
    case 'LINEA':
      return 'Linea'
    default:
      return name
  }
}
