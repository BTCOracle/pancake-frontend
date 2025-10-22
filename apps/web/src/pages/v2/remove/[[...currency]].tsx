import { useCurrency } from 'hooks/Tokens'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import RemoveLiquidity, { RemoveLiquidityV2Layout } from 'views/RemoveLiquidity'
import RemoveLiquidityV2FormProvider from 'views/RemoveLiquidity/RemoveLiquidityV2FormProvider'

const RemoveLiquidityPage = () => {
  const router = useRouter()

  const [currencyIdA, currencyIdB] = router.query.currency || []
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]

  useEffect(() => {
    if (!router.isReady) return

    const currency = (router.query.currency as string[]) || []

    if (currency.length === 0) {
      router.replace('/pool')
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
        router.replace(`/v2/remove/${currency0}/${currency1}`)
      }
    }
  }, [router])

  const props = {
    currencyIdA,
    currencyIdB,
    currencyA,
    currencyB,
  }

  return (
    <RemoveLiquidityV2FormProvider>
      <RemoveLiquidityV2Layout {...props}>
        <RemoveLiquidity {...props} />
      </RemoveLiquidityV2Layout>
    </RemoveLiquidityV2FormProvider>
  )
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/

const Page = dynamic(() => Promise.resolve(RemoveLiquidityPage), { ssr: false }) as NextPageWithLayout

Page.chains = CHAIN_IDS
Page.screen = true

export default Page
