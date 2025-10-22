import { GraphQLClient } from 'graphql-request'

const requestWithTimeout = async <T>(
  graphQLClient: GraphQLClient,
  request: string,
  variables?: any,
  timeout = 30000,
): Promise<T> => {
  try {
    const response = await Promise.race([
      variables ? graphQLClient.request<T>(request, variables) : graphQLClient.request<T>(request),
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${timeout} milliseconds`))
        }, timeout)
      }),
    ])

    return response
  } catch (error: any) {
    console.warn('GraphQL Request Error:', error)
    throw new Error(`GraphQL request failed: ${error.message}`)
  }
}

export default requestWithTimeout
