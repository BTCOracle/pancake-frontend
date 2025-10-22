import { useEffect } from 'react'
import EditFarm from '@/features/Farm/Edit'
import { useAppStore, useClmmStore } from '@/store'

function FarmEditPage() {
  const raydium = useAppStore((s) => s.raydium)
  const loadOperationOwnersAct = useClmmStore((s) => s.loadOperationOwnersAct)

  useEffect(() => {
    raydium && loadOperationOwnersAct({ checkFetch: true })
  }, [loadOperationOwnersAct, raydium])

  return <EditFarm />
}

export default FarmEditPage

export async function getStaticProps() {
  return {
    props: { title: 'Edit Farm' }
  }
}
