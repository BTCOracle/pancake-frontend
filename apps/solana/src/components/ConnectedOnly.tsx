import { ReactNode } from 'react'
import { useAppStore } from '@/store/useAppStore'

function ConnectedOnly({ children }: { children: ReactNode }) {
  const connected = useAppStore((s) => s.connected)
  return connected ? <>{children}</> : null
}

export default ConnectedOnly
