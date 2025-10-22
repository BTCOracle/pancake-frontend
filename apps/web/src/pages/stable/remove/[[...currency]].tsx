import { useCurrency } from 'hooks/Tokens'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import RemoveLiquidityV2FormProvider from 'views/RemoveLiquidity/RemoveLiquidityV2FormProvider'
import RemoveStableLiquidity, { RemoveLiquidityStableLayout } from 'views/RemoveLiquidity/RemoveStableLiquidity'
import useStableConfig, { StableConfigContext } from 'views/Swap/hooks/useStableConfig'

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/

const RemoveStableLiquidityPage = () => {
  const router = useRouter()

  const [currencyIdA, currencyIdB] = router.query.currency || []

  useEffect(() => {
    if (!router.isReady) return

    const currency = router.query.currency as string[] | undefined

    if (!currency || currency.length === 0) {
      router.replace('/404')
      return
    }

    if (currency.length === 1) {
      if (!OLD_PATH_STRUCTURE.test(currency[0])) {
        router.replace('/pool')
        return
      }

      const split = currency[0].split('-')
      if (split.length > 1) {
        const [currency0, currency1] = split
        router.replace(`/stable/remove/${currency0}/${currency1}`)
      }
    }
  }, [router])

  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]

  const stableConfig = useStableConfig({
    tokenA: currencyA,
    tokenB: currencyB,
  })

  const props = {
    currencyIdA,
    currencyIdB,
    currencyA,
    currencyB,
  }

  return (
    stableConfig.stableSwapConfig && (
      <RemoveLiquidityV2FormProvider>
        <StableConfigContext.Provider value={stableConfig}>
          <RemoveLiquidityStableLayout {...props}>
            <RemoveStableLiquidity {...props} />
          </RemoveLiquidityStableLayout>
        </StableConfigContext.Provider>
      </RemoveLiquidityV2FormProvider>
    )
  )
}

const Page = dynamic(() => Promise.resolve(RemoveStableLiquidityPage), {
  ssr: false,
}) as NextPageWithLayout

Page.chains = CHAIN_IDS

export default Page
