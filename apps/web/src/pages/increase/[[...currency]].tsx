import { CAKE, USDC } from '@pancakeswap/tokens'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import IncreaseLiquidityV3 from 'views/AddLiquidityV3/IncreaseLiquidityV3'
import LiquidityFormProvider from 'views/AddLiquidityV3/formViews/V3FormView/form/LiquidityFormProvider'

const IncreaseLiquidityPage = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()

  const native = useNativeCurrency()

  const [currencyIdA, currencyIdB] = router.query.currency || [
    native.symbol,
    (chainId && CAKE[chainId]?.address) ?? (chainId && USDC[chainId]?.address),
  ]

  useEffect(() => {
    if (!router.isReady) return

    const currency = (router.query.currency as string[]) || []
    const [curA, curB, feeAmountFromUrl, tokenId] = currency
    const match = curA?.match(OLD_PATH_STRUCTURE)

    const isNumberReg = /^\d+$/

    if (match?.length) {
      router.replace(`/add/${match[1]}/${match[2]}`)
      return
    }

    if (curA && curB && curA.toLowerCase() === curB.toLowerCase()) {
      router.replace(`/add/${curA}`)
      return
    }

    if (!(feeAmountFromUrl as string)?.match(isNumberReg) || !(tokenId as string)?.match(isNumberReg)) {
      router.replace('/add')
    }
  }, [router])

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  return (
    <LiquidityFormProvider>
      <IncreaseLiquidityV3 currencyA={currencyA} currencyB={currencyB} />
    </LiquidityFormProvider>
  )
}
const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40}|BNB)-(0x[a-fA-F0-9]{40}|BNB)$/

const Page = dynamic(() => Promise.resolve(IncreaseLiquidityPage), { ssr: false }) as NextPageWithLayout

Page.chains = CHAIN_IDS
Page.screen = true

export default Page
