import { getCurrencyAddress } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { Atom, atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { AtomFamily } from 'jotai/vanilla/utils/atomFamily'
import { QuoteQuery } from 'quoter/quoter.types'
import { InterfaceOrder } from 'views/Swap/utils'
import { atomWithLoadable } from './atomWithLoadable'
import { bestAMMTradeFromQuoterWorker2Atom } from './bestAMMTradeFromQuoterWorker2Atom'
import { bestAMMTradeFromQuoterWorkerAtom } from './bestAMMTradeFromQuoterWorkerAtom'
import { bestRoutingSDKTradeAtom } from './bestRoutingSDKTradeAtom'
import { bestXApiAtom } from './bestXAPIAtom'

type AtomType = AtomFamily<QuoteQuery, Atom<Loadable<InterfaceOrder>>>
export interface StrategyRoute {
  query: AtomType
  overrides: Partial<QuoteQuery>
  isShadow?: boolean // shadow queries don't provide final result, used for get quite quote for user
  priority?: number
  key: string
}

const Strategies = {
  single: {
    query: bestAMMTradeFromQuoterWorker2Atom,
    overrides: {
      maxHops: 1,
      maxSplits: 0,
    },
  },
  'routing-sdk': {
    query: bestRoutingSDKTradeAtom,
    overrides: {},
  },
  x: {
    query: bestXApiAtom,
    overrides: {},
  },
  full: {
    query: bestAMMTradeFromQuoterWorkerAtom,
    overrides: {},
  },
}

interface StrategyConfig {
  key: keyof typeof Strategies
  priority: number
  isShadow?: boolean
}

const defaultRoutingConfig: StrategyConfig[] = [
  // Single hop route & with light pools
  {
    key: 'single',
    priority: 1,
  },
  // routing-sdk
  {
    key: 'routing-sdk',
    priority: 1,
  },
  // X
  {
    key: 'x',
    priority: 1,
  },
  {
    // Fallback full route
    key: 'full',
    priority: 2,
  },
]

interface TokenSpecificRoutingStrategy {
  [chainId: number]: {
    [address: string]: StrategyConfig[]
  }
}

export const getTokenRoutingConfig = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_PROOF_API}/cms-config/tokens-routing-config.json`)
    if (!response.ok) {
      return {}
    }
    return response.json()
  } catch (ex) {
    return {}
  }
}

export const tokenRoutingConfigForInitAtom = atomWithLoadable<TokenSpecificRoutingStrategy>(async () => {
  try {
    return await getTokenRoutingConfig()
  } catch (ex) {
    return {}
  }
})

export const routingStrategyAtom = atomFamily(
  (query: QuoteQuery) => {
    return atom((get) => {
      const config = get(tokenRoutingConfigForInitAtom)
      if (!config.isJust()) {
        throw new Error('Routing config not loaded')
      }

      return getRoutingStrategy(query, config.unwrap())
    })
  },
  (a, b) => a.hash === b.hash,
)

function getRoutingStrategy(query: QuoteQuery, tokenSpecificConfig: TokenSpecificRoutingStrategy): StrategyRoute[] {
  const currencyA = query.baseCurrency!
  const currencyB = query.currency!
  const chainId = currencyA.chainId
  const addressA = getCurrencyAddress(currencyA)
  const addressB = getCurrencyAddress(currencyB)
  const config =
    tokenSpecificConfig[chainId]?.[addressA] || tokenSpecificConfig[chainId]?.[addressB] || defaultRoutingConfig

  return config.map((x) => {
    const strategy = Strategies[x.key]
    if (!strategy) {
      throw new Error(`Routing strategy ${x.key} not found`)
    }
    return {
      ...strategy,
      ...x,
    } as StrategyRoute
  })
}
