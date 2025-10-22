import { useEffect } from 'react'
import CreateFarm from '@/features/Farm/Create'
import { useAppStore, useClmmStore } from '@/store'

function FarmCreatePage() {
  const raydium = useAppStore((s) => s.raydium)
  const loadOperationOwnersAct = useClmmStore((s) => s.loadOperationOwnersAct)

  useEffect(() => {
    raydium && loadOperationOwnersAct({ checkFetch: true })
  }, [loadOperationOwnersAct, raydium])

  return <CreateFarm />
}

export default FarmCreatePage

export async function getStaticProps() {
  return {
    props: { title: 'Create Farm' }
  }
}
