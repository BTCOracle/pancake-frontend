import { useActiveIfoConfigAcrossChains } from 'hooks/useIfoConfig'
import dayjs from 'dayjs'

export const useShouldRenderAdIfo = () => {
  const ifoConfig = useActiveIfoConfigAcrossChains()

  return Boolean(ifoConfig && dayjs().isBefore(dayjs.unix(ifoConfig.plannedStartTime || 0)))
}
