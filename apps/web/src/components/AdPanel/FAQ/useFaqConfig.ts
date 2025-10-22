import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { faqConfig, faqTypeByPage } from './config'
import { FAQConfig } from './types'

export const useFaqConfig = (): FAQConfig => {
  const router = useRouter()

  return useMemo(() => {
    if (!router.isReady) {
      return (() => ({})) as unknown as FAQConfig
    }

    return faqConfig[faqTypeByPage[router.pathname]] ?? ((() => ({})) as unknown as FAQConfig)
  }, [router])
}
