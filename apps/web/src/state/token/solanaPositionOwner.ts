import { Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'

const fetchSolanaV3PositionOwner = async (connection: Connection, nftMintId: string) => {
  const tokenAccounts = await connection.getTokenLargestAccounts(new PublicKey(nftMintId))
  const tokenAccountWithBalance = tokenAccounts.value.find((account) => account.amount === '1')

  if (!tokenAccountWithBalance) {
    return null
  }

  const tokenAccountInfo = await connection.getAccountInfo(tokenAccountWithBalance.address)

  if (!tokenAccountInfo) {
    return null
  }

  const ownerAddress = new PublicKey(tokenAccountInfo.data.slice(32, 64))

  return ownerAddress.toBase58()
}

export const useV3MintOwner = (nftMintId: string | undefined | null) => {
  const connection = useSolanaConnectionWithRpcAtom()
  return useQuery({
    queryKey: ['solana-v3-mint-owner', nftMintId],
    queryFn: async () => {
      if (!nftMintId) return null
      if (!connection) return null
      return fetchSolanaV3PositionOwner(connection, nftMintId)
    },
    enabled: !!nftMintId && !!connection,
    staleTime: Infinity,
  })
}

export const useIsV3PositionOwner = (nftMintId: string | undefined | null, owner: string | undefined | null) => {
  const { data: positionOwner, isLoading } = useV3MintOwner(nftMintId)
  const isOwner = positionOwner && owner ? positionOwner === owner : false
  return { isOwner, isLoading }
}
