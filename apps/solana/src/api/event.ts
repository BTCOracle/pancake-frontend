import { parseUserAgent } from 'react-device-detect'
import { useAppStore } from '@/store/useAppStore'
import { isLocal } from '@/utils/common'
import axios from './axios'

interface EventTypeConnectWallet {
  walletName: string
  connectStatus: 'success' | 'userUnlink' | 'failure'
  type: 'connectWallet'
  // deviceType: 'pc' | 'mobile' | 'tablet'
  errorMsg?: string
}

export const sendWalletEvent = async (props: EventTypeConnectWallet) => {
  if (isLocal()) return
  try {
    const deviceInfo = parseUserAgent(window.navigator.userAgent)
    const deviceType = deviceInfo.device.type || 'pc'
    axios.post(
      `${useAppStore.getState().urlConfigs.MONITOR_BASE_HOST}/event`,
      {
        ...props,
        deviceType
      },
      { skipError: true }
    )
  } catch {
    console.log('send wallet event error')
  }
}
