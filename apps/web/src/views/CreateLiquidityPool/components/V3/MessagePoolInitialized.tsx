import { useMemo } from 'react'
import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Button, InfoIcon, Message, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DISABLED_ADD_LIQUIDITY_CHAINS } from 'config/constants/liquidity'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { PoolInfo } from 'state/farmsV4/state/type'
import { useFeeLevelQueryState } from 'state/infinity/create'
import { getPoolAddLiquidityLink } from 'utils/getPoolLink'
import { useCurrencies } from 'views/CreateLiquidityPool/hooks/useCurrencies'
import { isSolana } from '@pancakeswap/chains'

export const MessagePoolInitialized = ({ protocol }: { protocol?: Protocol }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const { chainId } = useSelectIdRouteParams()
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const [feeLevel] = useFeeLevelQueryState()

  const addLiquidityLink = useMemo(() => {
    if (!chainId || !protocol || !baseCurrency || !quoteCurrency) return undefined

    if (protocol === Protocol.V2) {
      return getPoolAddLiquidityLink({
        chainId,
        protocol: Protocol.V2,
        token0: baseCurrency,
        token1: quoteCurrency,
      } as PoolInfo)
    }
    if (isSolana(chainId)) {
      return getPoolAddLiquidityLink({
        chainId,
        protocol: Protocol.V3,
        token0: baseCurrency,
        token1: quoteCurrency,
        feeTier: feeLevel ?? undefined,
      } as PoolInfo)
    }
    return getPoolAddLiquidityLink({
      chainId,
      protocol: Protocol.V3,
      token0: baseCurrency,
      token1: quoteCurrency,
      feeTier: feeLevel ? feeLevel * 10_000 : undefined,
    } as PoolInfo)
  }, [chainId, protocol, baseCurrency, quoteCurrency, feeLevel])

  return (
    <Message
      variant="success"
      icon={<InfoIcon width="24px" color="#02919D" />}
      action={
        <Button
          as="a"
          mt="8px"
          width="100%"
          href={addLiquidityLink}
          disabled={Boolean(chainId && DISABLED_ADD_LIQUIDITY_CHAINS[chainId])}
        >
          {t('Add Liquidity')}
        </Button>
      }
      actionInline={!isMobile}
    >
      <Text small>{t('A pool with selected settings already exists. Please add liquidity instead.')}</Text>
    </Message>
  )
}
