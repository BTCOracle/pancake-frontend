import { LanguageProvider } from '@pancakeswap/localization'
import { DialogProvider, ModalProvider, UIKitProvider, dark, light } from '@pancakeswap/uikit'
import { Store } from '@reduxjs/toolkit'
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HistoryManagerProvider } from 'contexts/HistoryContext'
import { FirebaseAuthProvider } from 'wallet/Privy/firebase'
import { PrivyProvider } from 'wallet/Privy/privy'
import { W3WConfigProvider } from 'contexts/W3WConfigContext'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import { useMemo } from 'react'
import { Provider } from 'react-redux'
import { WagmiProvider } from 'wagmi'
import { createWagmiConfig } from 'utils/wagmi'
import { WalletProvider } from 'wallet/WalletProvider'
// Create a client
const queryClient = new QueryClient()

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  const { resolvedTheme } = useNextTheme()
  return (
    <UIKitProvider theme={resolvedTheme === 'dark' ? dark : light} {...props}>
      {children}
    </UIKitProvider>
  )
}

const Providers: React.FC<
  React.PropsWithChildren<{
    store: Store
    children: React.ReactNode
    dehydratedState: any
  }>
> = ({ children, store, dehydratedState }) => {
  return (
    <FirebaseAuthProvider>
      <Provider store={store}>
        <LanguageProvider>
          <PrivyProvider>
            <QueryClientProvider client={queryClient}>
              <WalletProvider>
                <HydrationBoundary state={dehydratedState}>
                  <NextThemeProvider>
                    <StyledUIKitProvider>
                      <HistoryManagerProvider>
                        <ModalProvider portalProvider={DialogProvider}>{children}</ModalProvider>
                      </HistoryManagerProvider>
                    </StyledUIKitProvider>
                  </NextThemeProvider>
                </HydrationBoundary>
              </WalletProvider>
            </QueryClientProvider>
          </PrivyProvider>
        </LanguageProvider>
      </Provider>
    </FirebaseAuthProvider>
  )
}

// Test-only Provider that excludes PrivyProvider and FirebaseAuthProvider
export const TestProviders: React.FC<
  React.PropsWithChildren<{
    store: Store
    children: React.ReactNode
    dehydratedState: any
  }>
> = ({ children, store, dehydratedState }) => {
  const wagmiConfig = useMemo(() => createWagmiConfig(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <W3WConfigProvider value={false}>
          <HydrationBoundary state={dehydratedState}>
            <Provider store={store}>
              <NextThemeProvider>
                <StyledUIKitProvider>
                  <HistoryManagerProvider>
                    <ModalProvider portalProvider={DialogProvider}>{children}</ModalProvider>
                  </HistoryManagerProvider>
                </StyledUIKitProvider>
              </NextThemeProvider>
            </Provider>
          </HydrationBoundary>
        </W3WConfigProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default Providers
