import { Swap } from '@pancakeswap/widgets-internal'

export const ExchangeLayout = ({ children }: React.PropsWithChildren) => {
  return <Swap.Page>{children}</Swap.Page>
}
