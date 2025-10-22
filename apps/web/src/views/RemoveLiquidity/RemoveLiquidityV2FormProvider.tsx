import { useMemo } from 'react'
import { createFormAtom, RemoveLiquidityV2AtomProvider } from 'state/burn/reducer'

export default function RemoveLiquidityV2FormProvider({ children }: { children: React.ReactNode }) {
  const formAtomProvider = useMemo(
    () => ({
      formAtom: createFormAtom(),
    }),
    [],
  )

  return <RemoveLiquidityV2AtomProvider value={formAtomProvider}>{children}</RemoveLiquidityV2AtomProvider>
}
