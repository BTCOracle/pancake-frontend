import { useIFOPoolInfo } from './ifo/useIFOPoolInfo'
import { useIFOInfo } from './ifo/useIFOInfo'
import { useIFOUserStatus } from './ifo/useIFOUserStatus'
import { useIfoV2Context } from '../contexts/useIfoV2Context'

const useIfo = () => {
  const ctx = useIfoV2Context()

  const info = useIFOInfo()
  const pools = useIFOPoolInfo()
  const users = useIFOUserStatus()

  return { ...ctx, info, pools, users }
}

export default useIfo
