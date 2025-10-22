import { ErrorBoundary as SErrorBoundary } from '@sentry/nextjs'
import { useTranslation } from '@pancakeswap/localization'
import { Button, Text, LogoIcon, Flex, IconButton, CopyIcon, copyText } from '@pancakeswap/uikit'
import { PropsWithChildren, useCallback } from 'react'
import Page from './Layout/Page'

export function SentryErrorBoundary({ children }: PropsWithChildren) {
  const { t } = useTranslation()
  const handleOnClick = useCallback(() => window.open('https://pancakeswap.finance', '_self'), [])
  return (
    <SErrorBoundary
      beforeCapture={(scope) => {
        scope.setLevel('fatal')
      }}
      fallback={({ eventId, componentStack, error }) => {
        return (
          <Page title="">
            <Flex flexDirection="column" justifyContent="center" alignItems="center">
              <LogoIcon width="64px" mb="8px" />
              <Text mb="16px">{t('Oops, something wrong.')}</Text>
              {eventId && (
                <Flex flexDirection="column" style={{ textAlign: 'center' }} mb="8px">
                  <Text>{t('Error Tracking Id')}</Text>
                  <Flex alignItems="center">
                    <Text>{eventId}</Text>
                    <IconButton variant="text" onClick={() => copyText(eventId)}>
                      <CopyIcon color="primary" width="24px" />
                    </IconButton>
                  </Flex>
                </Flex>
              )}
              <Button onClick={handleOnClick}>{t('Click here to reset!')}</Button>
            </Flex>
            {process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' && (
              <pre>
                <code>{error instanceof Error ? error?.message : (error as Error)?.message}</code>
                <code>{componentStack}</code>
              </pre>
            )}
          </Page>
        )
      }}
    >
      {children}
    </SErrorBoundary>
  )
}
