import { isSolana } from '@pancakeswap/chains'
import { Currency, SPLToken } from '@pancakeswap/sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { ChevronRightIcon, Flex, Text } from '@pancakeswap/uikit'
import { SHORT_SYMBOL } from 'components/NetworkSwitcher'
import { useUnifiedCurrency } from 'hooks/Tokens'
import upperCase from 'lodash/upperCase'
import { memo } from 'react'
import { unwrappedToken } from 'utils/wrappedCurrency'

function RouteView({ symbol, chainId, isLastItem }: { symbol: string; chainId?: number; isLastItem: boolean }) {
  return (
    <>
      <Flex alignItems="end">
        <Text fontSize="14px" ml="0.125rem" mr="0.125rem">
          {symbol} {chainId ? `(${upperCase(SHORT_SYMBOL[chainId])})` : ''}
        </Text>
      </Flex>
      {!isLastItem && <ChevronRightIcon color="textSubtle" width="20px" />}
    </>
  )
}

const SolanaSwapRouteView = memo(function SolanaSwapRoute({
  currencyId,
  isLastItem,
  chainId,
}: {
  chainId: number
  currencyId: string
  isLastItem: boolean
}) {
  // why need to use useUnifiedCurrency here?
  // see JupiterPairNodes.tsx for more details
  const currency = useUnifiedCurrency(currencyId, chainId)

  return (
    <RouteView
      symbol={(currency?.isNative ? currency?.symbol : currency?.wrapped.symbol) || 'Unknown'}
      isLastItem={isLastItem}
    />
  )
})

export default memo(function SwapRoute({ path, type }: { path?: Currency[]; type?: RouteType }) {
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {path?.map((token, i) => {
        const isLastItem: boolean = i === path.length - 1

        // unwrappedToken is only for evm chain

        if (type === RouteType.SVM) {
          const currency = token as SPLToken
          return (
            <SolanaSwapRouteView
              chainId={currency.chainId}
              currencyId={currency.address}
              isLastItem={isLastItem}
              key={`${currency?.wrapped.address}_${i}`}
            />
          )
        }

        const currency = (!isSolana(token.chainId) && token.isToken && unwrappedToken(token)) || token

        return (
          <RouteView
            symbol={currency?.symbol}
            chainId={type === RouteType.BRIDGE ? currency?.chainId : undefined}
            isLastItem={isLastItem}
            key={`${currency?.wrapped.address}_${i}`}
          />
        )
      })}
    </Flex>
  )
})
