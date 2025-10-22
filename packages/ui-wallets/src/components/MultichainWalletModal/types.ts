import { ModalV2Props } from '@pancakeswap/uikit'
import { EvmConnectorNames } from '../../config/connectorNames'
import { ConnectData, WalletConfigV3 } from '../../types'

export interface MultichainWalletModalProps extends ModalV2Props {
  evmAddress: string | undefined
  solanaAddress: string | undefined
  wallets?: WalletConfigV3[]
  topWallets?: WalletConfigV3[]
  evmLogin: (wallet: WalletConfigV3<EvmConnectorNames>) => Promise<ConnectData | undefined>
  createEvmQrCode?: () => () => Promise<string>
  // solanaLogin?: (walletName: WalletName) => Promise<string | undefined>
  onWalletConnectCallBack?: (chainId?: number, walletTitle?: string, address?: string) => void
  fullSize?: boolean
  docText: string
  docLink: string
  onGoogleLogin?: () => void
  onXLogin?: () => void
  onTelegramLogin?: () => void
  onDiscordLogin?: () => void
  onReopenWalletModal?: () => void
}
