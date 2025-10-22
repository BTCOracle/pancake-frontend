import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { LanguageProvider } from '@pancakeswap/localization'
import { skipRetryStatus } from '@/api/axios'
import WalletProvider from './WalletProvider'
import ThemeProvider from './ThemeProvider'
import GlobalColorProvider from './GlobalColorProvider'
import { ListContext } from './ListProvider'
import { QueryClientProvider } from './QueryClientProvider'

export { WalletProvider, ThemeProvider, GlobalColorProvider, ListContext }

const timeoutId: Record<string, number> = {}
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <LanguageProvider>
      <SWRConfig
        value={{
          onErrorRetry: (error, key, config, revalidate, { retryCount: apiRetryCount }) => {
            if (skipRetryStatus.has(error.response?.status) || error.code === 'ERR_NETWORK') return
            const is429 = error.message?.indexOf('429') !== -1
            if (apiRetryCount >= 10) return

            // Retry after 5 seconds.
            if (timeoutId[key]) {
              clearTimeout(timeoutId[key])
            }
            timeoutId[key] = window.setTimeout(() => revalidate({ retryCount: apiRetryCount }), is429 ? apiRetryCount * 1000 : 5000)
          }
        }}
      >
        <ThemeProvider>
          <QueryClientProvider>
            <GlobalColorProvider>
              <WalletProvider>{children}</WalletProvider>
            </GlobalColorProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SWRConfig>
    </LanguageProvider>
  )
}
