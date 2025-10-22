import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'

const RemoveLiquidityView = dynamic(
  () => import('views/Liquidity/RemoveLiquidityView').then((mod) => mod.RemoveLiquidityView),
  {
    ssr: false,
  },
)
const RemoveLiquidityPage = () => {
  const router = useRouter()
  const { tokenId } = router.query

  useEffect(() => {
    const isNumberReg = /^\d+$/

    if (tokenId && typeof tokenId === 'string' && !tokenId.match(isNumberReg)) {
      router.replace('/add')
    }
  }, [tokenId, router])

  return <RemoveLiquidityView />
}

const Page = dynamic(() => Promise.resolve(RemoveLiquidityPage), { ssr: false }) as NextPageWithLayout

Page.chains = CHAIN_IDS
Page.screen = true

export default Page
