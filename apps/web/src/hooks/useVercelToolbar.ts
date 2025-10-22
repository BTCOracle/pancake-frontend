import { useState } from 'react'

import { isVercelToolbarEnabled, shouldInjectVercelToolbar } from 'utils/vercelToolbar'

export function useShouldInjectVercelToolbar() {
  const [shouldInject] = useState(shouldInjectVercelToolbar())
  return shouldInject
}

export function useVercelToolbarEnabled() {
  const [enabled] = useState(isVercelToolbarEnabled())
  return enabled
}
