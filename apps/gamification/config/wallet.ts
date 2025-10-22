import { isCyberWallet } from '@cyberlab/cyber-app-sdk'
import { ChainId } from '@pancakeswap/chains'
import { LegacyWalletConfig, LegacyWalletIds } from '@pancakeswap/ui-wallets'
import { WalletFilledIcon } from '@pancakeswap/uikit'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { getTrustWalletProvider } from '@pancakeswap/wagmi/connectors/trustWallet'
import type { ExtendEthereum } from 'global'
import { Config } from 'wagmi'
import { ConnectMutateAsync } from 'wagmi/query'
import { chains, createWagmiConfig, walletConnectNoQrCodeConnector } from '../utils/wagmi'
import { ASSET_CDN } from './constants/endpoints'

export enum ConnectorNames {
  MetaMask = 'metaMask',
  Injected = 'injected',
  WalletConnect = 'walletConnect',
  WalletConnectV1 = 'walletConnectLegacy',
  // BSC = 'bsc',
  BinanceW3W = 'BinanceW3WSDK',
  Blocto = 'blocto',
  WalletLink = 'coinbaseWalletSDK',
  // Ledger = 'ledger',
  TrustWallet = 'trust',
  CyberWallet = 'cyberWallet',
}

export const TOP_WALLET_MAP: { [chainId: number]: LegacyWalletIds[] } = {
  [ChainId.BSC]: [LegacyWalletIds.Metamask, LegacyWalletIds.Trust, LegacyWalletIds.Okx, LegacyWalletIds.BinanceW3W],
  [ChainId.ETHEREUM]: [LegacyWalletIds.Metamask, LegacyWalletIds.Trust, LegacyWalletIds.Okx],
  [ChainId.ZKSYNC]: [LegacyWalletIds.Metamask, LegacyWalletIds.Trust, LegacyWalletIds.Okx],
  [ChainId.ARBITRUM_ONE]: [LegacyWalletIds.Metamask, LegacyWalletIds.Trust, LegacyWalletIds.Okx],
  [ChainId.BASE]: [LegacyWalletIds.Metamask, LegacyWalletIds.Trust, LegacyWalletIds.Okx],
}

const createQrCode =
  <config extends Config = Config, context = unknown>(chainId: number, connect: ConnectMutateAsync<config, context>) =>
  async () => {
    const wagmiConfig = createWagmiConfig()
    const injectedConnector = wagmiConfig.connectors.find((connector) => connector.id === ConnectorNames.Injected)
    if (!injectedConnector) {
      return ''
    }
    // HACK: utilizing event emitter from injected connector to notify wagmi of the connect events
    const connector = {
      ...walletConnectNoQrCodeConnector({
        chains,
        emitter: injectedConnector?.emitter,
      }),
      emitter: injectedConnector.emitter,
      uid: injectedConnector.uid,
    }
    const provider = await connector.getProvider()

    return new Promise<string>((resolve) => {
      provider.on('display_uri', (uri) => {
        resolve(uri)
      })
      connect({ connector, chainId })
    })
  }

const isMetamaskInstalled = () => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    if (window.ethereum?.isMetaMask) {
      return true
    }

    if (Array.isArray(window.ethereum?.providers)) {
      return window.ethereum?.providers.some((provider) => {
        try {
          return Boolean(provider.isMetaMask)
        } catch (e) {
          return false
        }
      })
    }
  } catch (e) {
    return false
  }

  return false
}

function isBinanceWeb3WalletInstalled() {
  try {
    return Boolean((safeGetWindow() as ExtendEthereum)?.isBinance)
  } catch (error) {
    console.error('Error checking Binance Web3 Wallet:', error)
    return false
  }
}

const walletsConfig = <config extends Config = Config, context = unknown>({
  chainId,
  connect,
}: {
  chainId: number
  connect: ConnectMutateAsync<config, context>
}): LegacyWalletConfig<ConnectorNames>[] => {
  const qrCode = createQrCode(chainId, connect)
  return [
    {
      id: LegacyWalletIds.Metamask,
      title: 'Metamask',
      icon: `${ASSET_CDN}/web/wallets/metamask.png`,
      get installed() {
        return isMetamaskInstalled()
        // && metaMaskConnector.ready
      },
      connectorId: ConnectorNames.MetaMask,
      deepLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
      qrCode,
      downloadLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
    },
    {
      id: LegacyWalletIds.Trust,
      title: 'Trust Wallet',
      icon: `${ASSET_CDN}/web/wallets/trust.png`,
      connectorId: ConnectorNames.TrustWallet,
      get installed() {
        return !!getTrustWalletProvider()
      },
      deepLink: 'https://link.trustwallet.com/open_url?coin_id=20000714&url=https://pancakeswap.finance/',
      downloadLink: 'https://trustwallet.com/browser-extension',
      guide: {
        desktop: 'https://trustwallet.com/browser-extension',
        mobile: 'https://trustwallet.com/',
      },
      qrCode,
    },
    {
      id: LegacyWalletIds.Okx,
      title: 'OKX Wallet',
      icon: `${ASSET_CDN}/web/wallets/okx-wallet.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean(safeGetWindow()?.okxwallet)
      },
      downloadLink: 'https://www.okx.com/download',
      deepLink:
        'https://www.okx.com/download?deeplink=okx%3A%2F%2Fwallet%2Fdapp%2Furl%3FdappUrl%3Dhttps%253A%252F%252Fpancakeswap.finance',
      guide: {
        desktop: 'https://www.okx.com/web3',
        mobile: 'https://www.okx.com/web3',
      },
      qrCode,
    },
    {
      id: LegacyWalletIds.BinanceW3W,
      title: 'Binance Wallet',
      icon: `${ASSET_CDN}/web/wallets/binance-w3w.png`,
      connectorId: isBinanceWeb3WalletInstalled() ? ConnectorNames.Injected : ConnectorNames.BinanceW3W,
      get installed() {
        if (isBinanceWeb3WalletInstalled()) {
          return true
        }
        // still showing the SDK if not installed
        return undefined
      },
    },
    {
      id: LegacyWalletIds.Coinbase,
      title: 'Coinbase Wallet',
      icon: `${ASSET_CDN}/web/wallets/coinbase.png`,
      connectorId: ConnectorNames.WalletLink,
    },
    {
      id: LegacyWalletIds.Walletconnect,
      title: 'WalletConnect',
      icon: `${ASSET_CDN}/web/wallets/walletconnect.png`,
      connectorId: ConnectorNames.WalletConnect,
    },
    {
      id: LegacyWalletIds.Opera,
      title: 'Opera Wallet',
      icon: `${ASSET_CDN}/web/wallets/opera.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean(safeGetWindow()?.ethereum?.isOpera)
      },
      downloadLink: 'https://www.opera.com/crypto/next',
    },
    {
      id: LegacyWalletIds.Brave,
      title: 'Brave Wallet',
      icon: `${ASSET_CDN}/web/wallets/brave.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean(safeGetWindow()?.ethereum?.isBraveWallet)
      },
      downloadLink: 'https://brave.com/wallet/',
    },
    {
      id: LegacyWalletIds.Rabby,
      title: 'Rabby Wallet',
      icon: `${ASSET_CDN}/web/wallets/rabby.png`,
      get installed() {
        return Boolean(safeGetWindow()?.ethereum?.isRabby)
      },
      connectorId: ConnectorNames.Injected,
      guide: {
        desktop: 'https://rabby.io/',
      },
      downloadLink: {
        desktop: 'https://rabby.io/',
      },
      qrCode,
    },
    {
      id: LegacyWalletIds.Math,
      title: 'MathWallet',
      icon: `${ASSET_CDN}/web/wallets/mathwallet.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean(safeGetWindow()?.ethereum?.isMathWallet)
      },
      qrCode,
    },
    {
      id: LegacyWalletIds.Tokenpocket,
      title: 'TokenPocket',
      icon: `${ASSET_CDN}/web/wallets/tokenpocket.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean(safeGetWindow()?.ethereum?.isTokenPocket)
      },
      qrCode,
    },
    {
      id: LegacyWalletIds.SafePal,
      title: 'SafePal',
      icon: `${ASSET_CDN}/web/wallets/safepal.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean((safeGetWindow()?.ethereum as ExtendEthereum)?.isSafePal)
      },
      downloadLink: 'https://safepal.com/en/extension',
      qrCode,
    },
    {
      id: LegacyWalletIds.Coin98,
      title: 'Coin98',
      icon: `${ASSET_CDN}/web/wallets/coin98.png`,
      connectorId: ConnectorNames.Injected,
      get installed() {
        return Boolean((safeGetWindow()?.ethereum as ExtendEthereum)?.isCoin98) || Boolean(safeGetWindow()?.coin98)
      },
      qrCode,
    },
    {
      id: LegacyWalletIds.Cyberwallet,
      title: 'CyberWallet',
      icon: `${ASSET_CDN}/web/wallets/cyberwallet.png`,
      connectorId: ConnectorNames.CyberWallet,
      get installed() {
        return Boolean(safeGetWindow() && isCyberWallet())
      },
      isNotExtension: true,
      guide: {
        desktop: 'https://docs.cyber.co/sdk/cyber-account#supported-chains',
      },
    },
    // {
    //   id: 'ledger',
    //   title: 'Ledger',
    //   icon: `${ASSET_CDN}/web/wallets/ledger.png`,
    //   connectorId: ConnectorNames.Ledger,
    // },
  ]
}

export const createWallets = <config extends Config = Config, context = unknown>(
  chainId: number,
  connect: ConnectMutateAsync<config, context>,
) => {
  const config = walletsConfig({ chainId, connect })
  const ethereum = safeGetWindow()?.ethereum
  const hasInjected = !!ethereum
  const injectedMeta = ethereum ? Object.keys(ethereum).filter((i) => i.match(/^is\w+/)) : []
  const injectedIsMetamask = injectedMeta.length === 1 && ethereum?.isMetaMask
  const injectedIsTrust = ethereum?.isTrust
  const currentInjectedWithinConfig =
    injectedIsMetamask ||
    injectedIsTrust ||
    config.some((c) => c.installed && ConnectorNames.Injected === c.connectorId)

  return !hasInjected || currentInjectedWithinConfig
    ? config
    : [
        ...config,
        // add injected icon if none of injected type wallets installed
        {
          id: LegacyWalletIds.Injected,
          title: 'Injected',
          icon: WalletFilledIcon,
          connectorId: ConnectorNames.Injected,
          installed: typeof window !== 'undefined' && Boolean(window.ethereum),
        },
      ]
}

const docLangCodeMapping: Record<string, string> = {
  it: 'italian',
  ja: 'japanese',
  fr: 'french',
  vi: 'vietnamese',
  id: 'indonesian',
  'zh-cn': 'chinese',
  'pt-br': 'portuguese-brazilian',
}

export const getDocLink = (code: string) =>
  docLangCodeMapping[code]
    ? `https://docs.pancakeswap.finance/v/${docLangCodeMapping[code]}/get-started/wallet-guide`
    : `https://docs.pancakeswap.finance/get-started/wallet-guide`
