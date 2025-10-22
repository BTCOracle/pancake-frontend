import { CAKE, USDC } from '@pancakeswap/tokens'
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

const AddLiquidityPage = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()

  const native = useNativeCurrency()

  const [currencyIdA, currencyIdB] = router.query.currency || [
    native.symbol,
    chainId ? CAKE[chainId]?.address ?? USDC[chainId]?.address : '',
  ]

  useEffect(() => {
    if (!router.isReady) return

    const currency = (router.query.currency as string[]) || []
    const [curA, curB] = currency
    const match = curA?.match(OLD_PATH_STRUCTURE)

    if (match?.length) {
      router.replace(`/add/${match[1]}/${match[2]}`)
      return
    }

    if (curA && curB && curA.toLowerCase() === curB.toLowerCase()) {
      router.replace(`/add/${curA}`)
    }
  }, [router])

  return (
    <AddLiquidityV2FormProvider>
      <AddLiquidityV3Layout>
        <UniversalAddLiquidity
          preferredSelectType={SELECTOR_TYPE.V2}
          currencyIdA={currencyIdA}
          currencyIdB={currencyIdB}
        />
      </AddLiquidityV3Layout>
    </AddLiquidityV2FormProvider>
  )
}

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40}|BNB)-(0x[a-fA-F0-9]{40}|BNB)$/

const Page = dynamic(() => Promise.resolve(AddLiquidityPage), { ssr: false }) as NextPageWithLayout

Page.chains = CHAIN_IDS
Page.screen = true

export default Page
