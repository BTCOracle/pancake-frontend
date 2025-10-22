import { memoizeAsync } from '@pancakeswap/utils/memoize'
import { Chain, createTransport, FallbackTransport, FallbackTransportConfig, Prettify, Transport } from 'viem'

type OnResponseFn = (
  args: {
    method: string
    params: unknown[]
    transport: ReturnType<Transport>
  } & (
    | {
        error?: undefined
        response: unknown
        status: 'success'
      }
    | {
        error: Error
        response?: undefined
        status: 'error'
      }
  ),
) => void

type OrderArgs = { chain?: Chain; transports: readonly Transport[] }

const getTransportOrder = memoizeAsync(
  async ({ chain, transports }: OrderArgs): Promise<number[]> => {
    if (!chain || Boolean(chain.testnet)) return transports.map((_, i) => i)

    const scores = await Promise.all(
      transports.map(async (transport, i) => {
        const transport_ = transport({ chain, retryCount: 0, timeout: 1_000 })

        const start = performance.now()
        let end: number
        let success = Number.MAX_SAFE_INTEGER
        try {
          await transport_.request({ method: 'eth_chainId' })
          success = 1
        } catch {
          // ignore
        } finally {
          end = performance.now()
        }

        return [success * (end - start), i] as const
      }),
    )

    return scores.sort((a, b) => a[0] - b[0]).map(([, i]) => i)
  },
  { resolver: ({ chain }) => chain?.id },
)

export const fallbackWithRank = <const transports extends readonly Transport[]>(
  transports_: transports,
  config: Prettify<Omit<FallbackTransportConfig, 'rank'>> = {},
): FallbackTransport<transports> => {
  const { key = 'fallback', name = 'Fallback', retryCount, retryDelay } = config
  return (({ chain, timeout, ...rest }) => {
    let transports = transports_

    let onResponse: OnResponseFn = () => {}

    const transport = createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          let includes: boolean | undefined

          const fetch = async (i = 0): Promise<any> => {
            const transport = transports[i]({
              ...rest,
              chain,
              retryCount: 0,
              timeout,
            })
            try {
              const response = await transport.request({
                method,
                params,
              } as any)

              onResponse({
                method,
                params: params as unknown[],
                response,
                transport,
                status: 'success',
              })

              return response
            } catch (err) {
              onResponse({
                error: err as Error,
                method,
                params: params as unknown[],
                transport,
                status: 'error',
              })

              // If we've reached the end of the fallbacks, throw the error.
              if (i === transports.length - 1) throw err

              // Check if at least one other transport includes the method
              includes ??= transports.slice(i + 1).some((transport) => {
                const { include, exclude } = transport({ chain }).config.methods || {}
                if (include) return include.includes(method)
                if (exclude) return !exclude.includes(method)
                return true
              })
              if (!includes) throw err

              // Otherwise, try the next fallback.
              return fetch(i + 1)
            }
          }
          return fetch()
        },
        retryCount,
        retryDelay,
        type: 'fallback',
      },
      {
        // eslint-disable-next-line no-return-assign
        onResponse: (fn: OnResponseFn) => (onResponse = fn),
        transports: transports.map((fn) => fn({ chain, retryCount: 0 })),
      },
    )

    rankTransports({
      chain,
      // eslint-disable-next-line no-return-assign
      onTransports: (transports_) => (transports = transports_ as transports),
      transports,
    })
    return transport
  }) as FallbackTransport<transports>
}

export const rankTransports = ({
  chain,
  onTransports,
  transports,
}: {
  chain?: Chain | undefined
  onTransports: (transports: readonly Transport[]) => void
  transports: readonly Transport[]
}) => {
  // ignore ranking for testnets
  if (!chain || Boolean(chain.testnet)) return

  const rankTransports_ = async () => {
    const order = await getTransportOrder({ chain, transports })
    const rankedTransports = order.map((i) => transports[i])
    onTransports(rankedTransports)
  }

  rankTransports_()
}
