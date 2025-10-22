import { PropsWithChildren } from 'react'
import useInitMobileDetector from '@/hooks/app/useInitMobileDetector'
import useLoadStorageData from '@/hooks/app/useLoadStorageData'

import useInitConnection from '../hooks/app/useInitConnection'
import useTokenAccountInfo from '../hooks/app/useTokenAccountInfo'
import useRefreshChainTime from '../hooks/app/useRefreshChainTime'
import useGlobalToast from '../hooks/toast/useGlobalToast'
import useTxStatus from '../hooks/toast/useTxStatus'
import useTokenSetting from '../hooks/token/useTokenSetting'
import AppVersion from './AppVersion'

export default function Content({ children, ...props }: PropsWithChildren) {
  // data related hooks
  useInitConnection(props)
  useTokenAccountInfo()
  // open it when implement farm part
  // useRefreshChainTime()
  useTokenSetting()
  useLoadStorageData()

  // ui related hooks
  useInitMobileDetector()
  useTxStatus()
  useGlobalToast()
  return (
    <>
      <AppVersion />
      {children}
    </>
  )
}
