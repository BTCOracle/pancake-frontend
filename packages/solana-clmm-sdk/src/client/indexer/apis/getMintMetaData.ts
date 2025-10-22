import { IndexerApiClient } from '../client'
import { paths } from '../schema'

export type MintMetaData =
  paths['/cached/v1/tokens/metadata/{address}']['get']['responses']['200']['content']['application/json']['data']

const getRPC = () => {
  try {
    const rpcFromEnvVars = JSON.parse(process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT_CONF ?? '[]')
    if (rpcFromEnvVars && rpcFromEnvVars.length) {
      return rpcFromEnvVars[0]
    }
    return undefined
  } catch (e) {
    return undefined
  }
}

const rpc = getRPC()

export const getMintMetaFromDAS = async (mint: string) => {
  if (!mint || !rpc) {
    return undefined
  }

  try {
    const resp = await fetch(rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'getAsset',
        jsonrpc: '2.0',
        id: new Date().getTime(),
        params: [mint],
      }),
    })
    const data = (await resp.json()) as {
      result?: {
        content?: any
        token_info?: any
      }
    }
    const metadata = data?.result?.content.metadata
    const links = data?.result?.content.links
    const tokenInfo = data?.result?.token_info
    if (metadata && tokenInfo) {
      return {
        success: true,
        data: {
          symbol: metadata.symbol,
          name: metadata.name,
          decimals: tokenInfo.decimals,
          address: mint,
          logoURI: links.image,
          programId: tokenInfo.token_program,
        } satisfies MintMetaData,
      }
    }

    return {
      error: {
        message: 'Failed to fetch mint metadata from DAS',
      },
    }
  } catch (error) {
    console.error('Error fetching mint metadata from DAS:', error)
    return {
      error: {
        message: 'Failed to fetch mint metadata from DAS',
      },
    }
  }
}

export const getMintMetaData = async (mint: string) => {
  if (!mint) {
    return undefined
  }
  try {
    const resp = await IndexerApiClient.GET('/cached/v1/tokens/metadata/{address}', {
      params: {
        path: {
          address: mint,
        },
      },
    })

    if (resp.error || !resp.data?.data) {
      throw new Error((resp as any).error.message || 'Failed to fetch mint metadata')
    }

    return {
      ...resp.data,
      data: {
        ...resp.data.data,
        tags: (resp.data.data as any).tags ?? [],
        extensions: (resp.data.data as any).extensions ?? {},
      },
    }
  } catch (error) {
    console.warn('Error fetching mint metadata:', error)
    // Fallback to fetching from DAS if the API call fails
    try {
      return getMintMetaFromDAS(mint)
    } catch (error) {
      console.error('Error fetching mint metadata from DAS:', error)
      // If both API calls fail, return undefined
      return undefined
    }
  }
}
