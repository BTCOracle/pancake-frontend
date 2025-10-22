import { CAKE, USDC } from '@pancakeswap/tokens'
import { Box, Spinner } from '@pancakeswap/uikit'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import AddLiquidityV2FormProvider from 'views/AddLiquidity/AddLiquidityV2FormProvider'
import { AddLiquidityV3Layout, UniversalAddLiquidity } from 'views/AddLiquidityV3'
import { SELECTOR_TYPE } from 'views/AddLiquidityV3/types'
import { PageWithoutFAQ } from 'views/Page'
import useStableConfig from 'views/Swap/hooks/useStableConfig'

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40}|BNB)-(0x[a-fA-F0-9]{40}|BNB)$/

const AddStableLiquidityPage = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()

  const native = useNativeCurrency()

  const [currencyIdA, currencyIdB] = router.query.currency || [
    native.symbol,
    chainId ? CAKE[chainId]?.address ?? USDC[chainId]?.address : '',
  ]

  useEffect(() => {
    const match = typeof currencyIdA === 'string' ? currencyIdA.match(OLD_PATH_STRUCTURE) : null

    if (match?.length) {
      router.replace(`/add/${match[1]}/${match[2]}`)
      return
    }

    if (
      currencyIdA &&
      currencyIdB &&
      typeof currencyIdA === 'string' &&
      typeof currencyIdB === 'string' &&
      currencyIdA.toLowerCase() === currencyIdB.toLowerCase()
    ) {
      router.replace(`/add/${currencyIdA}`)
    }
  }, [currencyIdA, currencyIdB, router])

  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]

  const stableConfig = useStableConfig({
    tokenA: currencyA,
    tokenB: currencyB,
  })

  if (!stableConfig.stableSwapConfig) {
    return (
      <PageWithoutFAQ>
        <AddLiquidityV3Layout>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner />
          </Box>
        </AddLiquidityV3Layout>
      </PageWithoutFAQ>
    )
  }

  return (
    <AddLiquidityV2FormProvider>
      <AddLiquidityV3Layout>
        <UniversalAddLiquidity
          preferredSelectType={SELECTOR_TYPE.STABLE}
          currencyIdA={currencyIdA}
          currencyIdB={currencyIdB}
        />
      </AddLiquidityV3Layout>
    </AddLiquidityV2FormProvider>
  )
}

const Page = dynamic(() => Promise.resolve(AddStableLiquidityPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = CHAIN_IDS

export default Page
