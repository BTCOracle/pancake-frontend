import createClient, { Middleware } from 'openapi-fetch'
import { paths } from './schema'

const endpoints = process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT

export const IndexerApiClient = createClient<paths>({
  baseUrl: endpoints,
})
