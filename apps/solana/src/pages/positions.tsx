import dynamic from 'next/dynamic'

const Positions = dynamic(() => import('@/features/Portfolio'))

function PositionsPage() {
  return <Positions />
}

export default PositionsPage

export async function getStaticProps() {
  return {
    props: { title: 'My Positions' }
  }
}
