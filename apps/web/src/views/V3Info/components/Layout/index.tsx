import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { SubMenuItems } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { multiChainQueryStableClient } from 'state/info/constant'
import { useChainIdByQuery, useChainNameByQuery, useMultiChainPath } from 'state/info/hooks'
import { v3InfoPath } from '../../constants'
import InfoNav from './InfoNav'

export const InfoPageLayout = ({ children }: { children?: React.ReactNode }) => {
  const router = useRouter()
  const chainName = useChainNameByQuery()
  const chainPath = useMultiChainPath()
  const isV3 = router?.pathname?.includes(v3InfoPath)
  const { t } = useTranslation()
  const chainId = useChainIdByQuery()
  const isInfinitySupported = useMemo(() => INFINITY_SUPPORTED_CHAINS.includes(chainId as any), [chainId])

  const subMenuItems = useMemo(() => {
    const config = [
      {
        label: t('V3'),
        href: `/info/v3${chainPath}`,
      },
      {
        label: t('V2'),
        href: `/info${chainPath}`,
      },
    ]
    if (isInfinitySupported) {
      config.unshift({
        label: t('Infinity'),
        href: `/info/infinity${chainPath}`,
      })
    }

    if (multiChainQueryStableClient[chainName])
      config.push({
        label: t('StableSwap'),
        href: `/info${chainPath}?type=stableSwap`,
      })
    return config
  }, [t, chainPath, chainName, isInfinitySupported])

  return (
    <>
      <SubMenuItems items={subMenuItems} activeItem={isV3 ? `/info/v3${chainPath}` : `/info${chainPath}`} />
      <InfoNav isStableSwap={false} />
      {children}
    </>
  )
}
