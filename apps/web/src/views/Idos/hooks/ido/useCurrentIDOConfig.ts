import { useRouter } from 'next/router'
import { IDOConfig, idoConfigDict } from '../../config'

export const useCurrentIDOConfig = (): IDOConfig | undefined => {
  const { query } = useRouter()
  const currentIdo = query.ido as string
  return idoConfigDict[currentIdo]
}
