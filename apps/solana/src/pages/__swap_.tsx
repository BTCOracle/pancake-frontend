import dynamic from 'next/dynamic'

const Swap = dynamic(() => import('@/features/Swap'), {
  ssr: false
})

function SwapPage() {
  return <Swap />
}

export default SwapPage
