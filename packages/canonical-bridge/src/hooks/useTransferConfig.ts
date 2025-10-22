import {
  cBridge,
  deBridge,
  ICBridgeTransferConfig,
  IChainConfig,
  ICustomizedBridgeConfig,
  IDeBridgeTransferConfig,
  IMesonTransferConfig,
  IMayanTransferConfig,
  IStargateTransferConfig,
  layerZero,
  meson,
  stargate,
  mayan,
} from '@bnb-chain/canonical-bridge-widget'
import { useEffect, useState } from 'react'

import axios from 'axios'
import { env } from '../configs/env'
import layerZeroConfig from '../token-config/mainnet/layerZero/config.json'

export function useTransferConfig(supportedChains: IChainConfig[]): ICustomizedBridgeConfig['transfer'] | undefined {
  const [transferConfig, setTransferConfig] = useState<ICustomizedBridgeConfig['transfer']>()

  useEffect(() => {
    const initConfig = async () => {
      const [cBridgeRes, deBridgeRes, stargateRes, mesonRes, mayanRes] = await Promise.all([
        axios.get<{ data: ICBridgeTransferConfig }>(`${env.SERVER_ENDPOINT}/api/bridge/v2/cbridge`),
        axios.get<{ data: IDeBridgeTransferConfig }>(`${env.SERVER_ENDPOINT}/api/bridge/v2/debridge`),
        axios.get<{ data: IStargateTransferConfig }>(`${env.SERVER_ENDPOINT}/api/bridge/v2/stargate`),
        axios.get<{ data: IMesonTransferConfig }>(`${env.SERVER_ENDPOINT}/api/bridge/v2/meson`),
        axios.get<{ data: IMayanTransferConfig }>(`${env.SERVER_ENDPOINT}/api/bridge/v2/mayan`),
      ])

      const cBridgeConfig = cBridgeRes.data.data
      const deBridgeConfig = deBridgeRes.data.data
      const mesonConfig = mesonRes.data.data
      const mayanConfig = mayanRes.data.data
      const stargateConfig = stargateRes.data.data

      const tokenConfig: ICustomizedBridgeConfig['transfer'] = {
        defaultFromChainId: 1,
        defaultToChainId: 56,
        defaultTokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        defaultAmount: '',
        chainOrders: [56, 1, 137, 324, 42161, 59144, 8453, 204],
        tokenOrders: [
          'CAKE',
          'USDC',
          'USDT',
          'FDUSD',
          'USDC.e',
          'ETH',
          'wBETH',
          'wstETH',
          'weETH',
          'UNI',
          'AAVE',
          'LDO',
          'LINK',
          'BTC',
          'BTCB',
          'WBTC',
          'sUSDe',
          'DOGE',
          'ADA',
          'DAI',
          'XRP',
          'PEPE',
          'ELON',
          'FLOKI',
          'MAGA',
          'BabyDoge',
          'BABYGROK',
          'PLANET',
          'OMNI',
          'AGI',
          'FET',
          'AIOZ',
          'AI',
          'NFP',
          'CGPT',
          'PHB',
          'ZIG',
          'NUM',
          'GHX',
          'PENDLE',
          'RDNT',
          'ROSE',
          'HOOK',
          'MASK',
          'EDU',
          'MBOX',
          'BNX',
        ],
        chainConfigs: supportedChains,
        displayTokenSymbols: {
          10: {
            '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': 'USDC.e',
          },
          56: {
            '0x2170Ed0880ac9A755fd29B2688956BD959F933F8': 'ETH',
          },
          137: {
            '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'USDC.e',
          },
          324: {
            '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4': 'USDC',
            '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4': 'USDC.e',
          },
          1101: {
            '0x37eAA0eF3549a5Bb7D431be78a3D99BD360d19e5': 'USDC.e',
          },
          42161: {
            '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': 'USDC.e',
          },
          43114: {
            '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664': 'USDC.e',
            '0xc7198437980c041c805A1EDcbA50c1Ce5db95118': 'USDT.e',
            '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB': 'WETH.e',
          },
        },
        providers: [
          cBridge({
            config: cBridgeConfig,
            excludedChains: [],
            excludedTokens: {
              56: ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'],

              42161: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'], // ['USDT', 'USDC.e']
            },
          }),
          deBridge({
            config: deBridgeConfig,
            excludedChains: [],
            excludedTokens: {
              // We excluded certain tokens because: previously during testing, these token transactions failed. Some due to internal errors from third parties, and others due to lack of liquidity, hence we removed them.
              1: ['cUSDCv3', '0x5e21D1EE5cf0077B314c381720273ae82378D613'],
              56: [
                '0x67d66e8Ec1Fd25d98B3Ccd3B19B7dc4b4b7fC493',
                '0x0000000000000000000000000000000000000000',
                '0x9C7BEBa8F6eF6643aBd725e45a4E8387eF260649',
              ],

              137: ['cUSDCv3'],
              42161: ['cUSDCv3'],
              43114: ['BNB'],
              7565164: [
                'So11111111111111111111111111111111111111112',
                'FmqVMWXBESyu4g6FT1uz1GABKdJ4j6wbuuLFwPJtqpmu',
                '2kaRSuDcz1V1kqq1sDmP23Wy98jutHQQgr5fGDWRpump',
                '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
              ],
            },
          }),
          stargate({
            config: stargateConfig,
            excludedChains: [],
            excludedTokens: {},
          }),
          layerZero({
            config: layerZeroConfig,
            excludedChains: [],
            excludedTokens: {},
          }),
          meson({
            config: mesonConfig,
            excludedChains: [],
            excludedTokens: {
              42161: ['SOL'],
            },
          }),
          mayan({
            config: mayanConfig,
            excludedChains: [],
            excludedTokens: {},
          }),
        ],
      }

      setTransferConfig(tokenConfig)
    }

    initConfig()
  }, [supportedChains])

  return transferConfig
}

function handleDeBridgeConfig(rawConfig: IDeBridgeTransferConfig) {
  const deBridgeConfig = {
    ...rawConfig,
  }

  const extraConfigs: Record<number, any[]> = {
    1: [
      {
        action: 'replace',
        target: '0xEBd9D99A3982d547C5Bb4DB7E3b1F9F14b67Eb83',
        data: {
          address: '0x2dfF88A56767223A5529eA5960Da7A3F5f766406',
          symbol: 'ID',
          decimals: 18,
          name: 'SPACE ID',
          logoURI: '',
          eip2612: false,
          tags: ['tokens'],
        },
      },
      {
        action: 'append',
        data: {
          address: '0x152649eA73beAb28c5b49B26eb48f7EAD6d4c898',
          symbol: 'Cake',
          decimals: 18,
          name: 'PancakeSwap Token',
          logoURI: '',
          eip2612: false,
          tags: ['tokens'],
        },
      },
    ],
  }

  Object.entries(deBridgeConfig.tokens).forEach(([key, value]) => {
    const chainId = Number(key)
    const extraConfig = extraConfigs[chainId]

    if (extraConfig) {
      extraConfig.forEach((network) => {
        const { action, target, data } = network
        if (!value[data.address]) {
          if (action === 'replace') {
            const index = value.findIndex((item) => item.address === target)
            if (index > -1) {
              // eslint-disable-next-line no-param-reassign
              value[index] = data
            }
          } else if (action === 'append') {
            ;(value as any).push(data)
          }
        }
      })
    }
  })

  return deBridgeConfig
}
