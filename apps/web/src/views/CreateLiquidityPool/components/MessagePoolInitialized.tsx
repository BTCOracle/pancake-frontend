import { getPoolId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, InfoIcon, Message, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { DISABLED_ADD_LIQUIDITY_CHAINS, getAddInfinityLiquidityURL } from 'config/constants/liquidity'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { usePoolKey } from '../hooks/useInfinityFormState/usePoolKey'
import { useIsPoolInitialized } from '../hooks/useIsPoolInitialized'

export const MessagePoolInitialized = () => {
  const { t } = useTranslation()
  const poolKey = usePoolKey()
  const { chainId } = useSelectIdRouteParams()
  const { data: poolInitialized } = useIsPoolInitialized(poolKey, chainId)

  const router = useRouter()
  const redirectToAddLiquidityPage = useCallback(() => {
    if (chainId && poolKey) {
      router.push(
        getAddInfinityLiquidityURL({
          chainId,
          poolId: getPoolId(poolKey),
        }),
      )
    }
  }, [chainId, poolKey, router])
  const { isXs } = useMatchBreakpoints()

  if (!poolInitialized) return null

  return (
    <Message
      variant="success"
      icon={<InfoIcon width="24px" color="#02919D" />}
      action={
        <Button
          mt="8px"
          width="100%"
          onClick={redirectToAddLiquidityPage}
          endIcon={isXs ? <AddIcon color="invertedContrast" width="24px" /> : null}
          disabled={Boolean(chainId && DISABLED_ADD_LIQUIDITY_CHAINS[chainId])}
        >
          {t('Add Liquidity')}
        </Button>
      }
      actionInline={!isXs}
    >
      <Text color="text">{t('A pool with the selected configuration already exists.')}</Text>
    </Message>
  )
}
