import { useUserCakeLockStatus } from 'hooks/useUserCakeLockStatus'
import { useMemo } from 'react'
import { useCompetitionStatus } from './useCompetitionStatus'
import { useVotingStatus } from './useVotingStatus'
import { useIfoStatus } from './useIfoStatus'

export const useMenuItemsStatus = (): Record<string, string> => {
  const ifoStatus = useIfoStatus()
  const competitionStatus = useCompetitionStatus()
  const votingStatus = useVotingStatus()
  const isUserLocked = useUserCakeLockStatus()

  return useMemo(() => {
    return {
      '/competition': competitionStatus || '',
      '/ifo': ifoStatus || '',
      ...(votingStatus && {
        '/voting': votingStatus,
      }),
      ...(isUserLocked && {
        '/pools': 'lock_end',
      }),
    }
  }, [competitionStatus, ifoStatus, votingStatus, isUserLocked])
}
