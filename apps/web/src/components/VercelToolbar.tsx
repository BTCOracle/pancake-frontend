import { Suspense, lazy } from 'react'

import { useShouldInjectVercelToolbar, useVercelToolbarEnabled } from 'hooks/useVercelToolbar'
import { FeatureFlags, useFeatureFlags } from 'hooks/useExperimentalFeatureEnabled'

const VercelToolbarComp = lazy(() =>
  import('@vercel/toolbar/next').then((module) => ({ default: module.VercelToolbar })),
)

export function safeJsonStringify(value: any): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

// Copy from flags/react/FlagValues.tsx
/**
 * Registers variant values with the toolbar
 */
export function FlagValues({ values }: { values: FeatureFlags }) {
  return (
    <script
      type="application/json"
      data-flag-values
      dangerouslySetInnerHTML={{
        __html: safeJsonStringify(values),
      }}
    />
  )
}

export function VercelToolbar() {
  const flags = useFeatureFlags()
  const enabled = useVercelToolbarEnabled()
  const shouldInject = useShouldInjectVercelToolbar()

  return enabled ? (
    <Suspense>
      {shouldInject ? (
        <Suspense>
          <VercelToolbarComp />
        </Suspense>
      ) : null}
      <FlagValues values={flags} />
    </Suspense>
  ) : null
}
