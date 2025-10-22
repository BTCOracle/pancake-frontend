import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useAppStore, useClmmStore } from '@/store'

const Pools = dynamic(() => import('@/features/Pools'))

function LiquidityPoolsPage() {
  const raydium = useAppStore((s) => s.raydium)
  const loadOperationOwnersAct = useClmmStore((s) => s.loadOperationOwnersAct)

  useEffect(() => {
    raydium && loadOperationOwnersAct({ checkFetch: true })
  }, [loadOperationOwnersAct, raydium])

  return <Pools />
}

export default LiquidityPoolsPage

export async function getStaticProps() {
  return {
    props: { title: 'Liquidity Pools' }
  }
}
