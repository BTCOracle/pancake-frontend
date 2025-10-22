import { useEffect } from 'react'
import { useAppStore } from '@/store'
import { useDeviceInfoDetector } from '../useMobileDetector'

export default function useInitMobileDetector() {
  const { isMobile, isDesktop } = useDeviceInfoDetector()
  useEffect(() => {
    useAppStore.setState({ isMobile })
  }, [isMobile])
  useEffect(() => {
    useAppStore.setState({ isDesktop })
  }, [isDesktop])
}
