import { QueryClient, QueryClientProvider as DefaultQueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

export const QueryClientProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  return (
    <DefaultQueryClientProvider client={queryClient} {...props}>
      {children}
    </DefaultQueryClientProvider>
  )
}
