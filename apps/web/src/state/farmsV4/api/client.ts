import createClient, { type Middleware } from 'openapi-fetch'
import { paths } from './schema'

const endpoints = process.env.NEXT_PUBLIC_REWARD_API_ENDPOINT || 'https://infinity.pancakeswap.com/'

export const throwOnError: Middleware = {
  async onResponse({ response: res }) {
    if (res.status >= 400) {
      const body = res.headers.get('content-type')?.includes('json')
        ? await res.clone().json()
        : await res.clone().text()
      throw new Error(body)
    }
    return undefined
  },
}

export const rewardApiClient = createClient<paths>({
  baseUrl: endpoints,
})
rewardApiClient.use(throwOnError)
