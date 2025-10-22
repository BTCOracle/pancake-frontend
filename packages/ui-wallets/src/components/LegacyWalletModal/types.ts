import { ModalV2Props } from '@pancakeswap/uikit'
import { ConnectData, WalletConfigV2 } from '../../types'

export interface WalletModalV2Props<T = unknown> extends ModalV2Props {
  wallets: WalletConfigV2<T>[]
  topWallets: WalletConfigV2<T>[]
  login: (wallet: WalletConfigV2<T>) => Promise<ConnectData | undefined>
  docLink: string
  docText: string
  mevDocLink: string | null
  onWalletConnectCallBack?: (walletTitle?: string, address?: string) => void
  fullSize?: boolean
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
  onReopenWalletModal?: () => void
}
