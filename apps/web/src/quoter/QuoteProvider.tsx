import { Suspense } from 'react'
import { QuoteContextProvider } from './hook/QuoteContext'
import { useQuoterSync } from './hook/useQuoterSync'

export const QuoteProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QuoteContextProvider>
      {children}
      <Suspense fallback={null}>
        <QuoteSync />
      </Suspense>
    </QuoteContextProvider>
  )
}

const QuoteSync = () => {
  useQuoterSync()
  return null
}
