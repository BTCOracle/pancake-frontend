import { useTranslation } from '@pancakeswap/localization'
import { Box, CheckmarkCircleFillIcon, CircleLoader, FlexGap, InfoIcon, Input, Text } from '@pancakeswap/uikit'
import Divider from 'components/Divider'
import { useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

import { isAddress } from 'viem/utils'
import { HookAddress, HookName, HookTagsComponent, HookVerification } from './HookSettingsList'
import { useManualHook } from './hooks/useManualHook'

const StyledInput = styled(Input)<{
  $isDanger?: boolean
}>`
  box-shadow: ${({ theme, $isDanger }) => ($isDanger ? theme.shadows.danger : '')};
`

export const HookSettingsManual = () => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const focusRef = useRef(false)
  const { manualHookAddress, manualHook, setManualHook, isVerifing } = useManualHook()
  const isVerified = manualHook?.isVerified

  useLayoutEffect(() => {
    if (isVerifing && inputRef.current?.disabled) {
      focusRef.current = true
      return
    }
    if (!isVerifing && focusRef.current) {
      focusRef.current = false
      inputRef.current?.focus()
    }
  }, [isVerifing])

  return (
    <FlexGap flexDirection="column" gap="8px">
      <HookAddress address={manualHook?.address}>
        <Box position="relative">
          <StyledInput
            ref={inputRef}
            value={manualHookAddress}
            onChange={(event) => setManualHook(event.target.value)}
            placeholder={t('Hook Contract Address')}
            $isDanger={manualHookAddress !== '' && !isAddress(manualHookAddress)}
            style={{ paddingRight: manualHookAddress ? '40px' : '10px' }}
            disabled={isVerifing}
          />
          {manualHookAddress ? (
            <Box position="absolute" right="14px" top="50%" style={{ transform: 'translateY(-50%)' }}>
              {isVerifing ? (
                <CircleLoader />
              ) : !isVerified ? (
                <InfoIcon color="failure" />
              ) : (
                <CheckmarkCircleFillIcon color="success" />
              )}
            </Box>
          ) : null}
        </Box>
      </HookAddress>
      <HookVerification selectedHook={manualHook} />
      {!isAddress(manualHookAddress) && manualHookAddress && <Text color="failure">{t('Invalid hook address')}</Text>}
      {manualHook && (
        <>
          <Divider />
          <HookName selectedHook={manualHook} />
          <HookTagsComponent selectedHook={manualHook} />
        </>
      )}
    </FlexGap>
  )
}
