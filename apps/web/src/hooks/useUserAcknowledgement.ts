import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { atomWithStorageSync } from 'utils/atomWithStorageSync'
import { useAccount } from 'wagmi'

export function useUserAcknowledgement(id: string) {
  const { address } = useAccount()
  const atom = useMemo(() => atomWithStorageSync(`pcs_user_ack_${id}_${address}`, false), [id, address])
  const [userACK, setUserACK] = useAtom(atom)

  const ack = useMemo(() => address && userACK, [address, userACK])
  const setAck = useCallback((value: boolean) => address && setUserACK(value), [address, setUserACK])

  return [ack, setAck] as const
}
