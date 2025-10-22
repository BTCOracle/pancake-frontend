import { createServer, RequestListener } from 'node:http'
import { AddressInfo } from 'node:net'
import { http } from 'viem'
import { bsc, bscTestnet, opBNB } from 'viem/chains'
import { Transport } from 'wagmi'
import { rankTransports } from './fallbackWithRank'

function createHttpServer(handler: RequestListener): Promise<{ close: () => Promise<unknown>; url: string }> {
  const server = createServer(handler)

  const closeAsync = () =>
    new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve(undefined))))

  return new Promise((resolve) => {
    server.listen(() => {
      const { port } = server.address() as AddressInfo
      resolve({ close: closeAsync, url: `http://localhost:${port}` })
    })
  })
}

describe('rankTransports', () => {
  test('should not rank for testnet', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const localTransport = http(server.url)
    const mockFn = vi.fn()

    rankTransports({
      chain: bscTestnet,
      onTransports: mockFn,
      transports: [localTransport],
    })

    expect(mockFn).toHaveBeenCalledTimes(0)
  })
  test('should rank for mainnet chain', async () => {
    const server = await createHttpServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ result: '0x1' }))
    })

    const localTransport = http(server.url)
    const mockFn = vi.fn()

    rankTransports({
      chain: bsc,
      onTransports: mockFn,
      transports: [localTransport],
    })

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockFn).toHaveBeenCalledTimes(1)
  })
  test('should rank with scores', async () => {
    const server1 = await createHttpServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ result: '0x1' }))
      }, 1)
    })
    const server100 = await createHttpServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ result: '0x1' }))
      }, 100)
    })
    const serverFailed = await createHttpServer((_req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal Server Error' }))
    })

    const transport1 = http(server1.url, { key: 'transport1' })
    const transport100 = http(server100.url, { key: 'transport100' })
    const transportFailed = http(serverFailed.url, { key: 'transportFailed' })

    const mockFn = vi.fn().mockImplementation((newTransports: Transport[]) => {
      expect(newTransports).toHaveLength(3)
      const rankedKeys = newTransports.map((t) => t({ chain: undefined }).config.key)
      expect(rankedKeys).toEqual(['transport1', 'transport100', 'transportFailed'])
    })

    rankTransports({
      chain: opBNB,
      onTransports: mockFn,
      transports: [transportFailed, transport100, transport1],
    })

    await new Promise((resolve) => setTimeout(resolve, 100))
  })
})
