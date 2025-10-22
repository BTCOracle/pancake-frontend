import { Box, ToastId, ToastPosition, UseToastOptions } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Alert, mediaQueries, Text } from '@pancakeswap/uikit'
import { Variants } from '@pancakeswap/uikit/components/Alert/types'
import styled from 'styled-components'
import { ToastStatus } from '@/types/tx'
import { colors } from '@/theme/cssVariables'

const toastDefaultConfig: { duration: number; position: ToastPosition } = {
  duration: 5000,
  position: 'top-right'
}

const StyledToast = styled.div`
  max-width: calc(100% - 32px);
  width: 100%;
  padding-right: 8px;

  ${mediaQueries.sm} {
    max-width: 400px;
  }
`

type CustomUseToastOptions = Omit<UseToastOptions, 'status'> & {
  status: ToastStatus
  icon?: React.ReactNode
  detail?: React.ReactNode
  fullWidth?: boolean
}

const alertTypeMap: Record<ToastStatus, Variants> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info'
}

interface ToasterProps {
  state: CustomUseToastOptions
  id: ToastId
  onClose: () => void
}

export function Toast({ state, onClose }: ToasterProps) {
  const [countDownController, setCountDownController] = useState({
    isCountDown: true,
    remainTime: state.duration ?? toastDefaultConfig.duration,
    endTime: new Date().getTime() + (state.duration ?? 0)
  })

  useEffect(() => {
    setCountDownController({
      isCountDown: true,
      remainTime: state.duration ?? toastDefaultConfig.duration,
      endTime: new Date().getTime() + (state.duration ?? 0)
    })
  }, [state.duration])

  useEffect(() => {
    if (countDownController.isCountDown && countDownController.remainTime) {
      const timeout = setTimeout(() => {
        onClose()
      }, countDownController.remainTime)

      return () => clearTimeout(timeout)
    }
  }, [countDownController.isCountDown, countDownController.remainTime, onClose])

  return (
    <StyledToast>
      <Alert variant={alertTypeMap[state.status] ?? 'info'} title={state.title as string} onClick={onClose}>
        <Text style={{ wordBreak: 'break-word' }} as="p">
          {state.description}
        </Text>
        {!state.fullWidth && Boolean(state.detail) && (
          <Box fontSize={12} fontWeight={500} color={state.status === 'info' ? colors.secondary : colors.primary60}>
            {state.detail}
          </Box>
        )}
      </Alert>
    </StyledToast>
  )
}
