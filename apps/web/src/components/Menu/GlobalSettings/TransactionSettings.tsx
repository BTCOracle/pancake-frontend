import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  Flex,
  FlexGap,
  Input,
  Message,
  QuestionHelper,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useEffect, useState } from 'react'
import { escapeRegExp } from 'utils'

import { VerticalDivider } from '@pancakeswap/widgets-internal'
import { useAutoSlippageEnabled } from 'hooks/useAutoSlippageWithFallback'
import { useUserTransactionTTL } from 'hooks/useTransactionDeadline'
import styled from 'styled-components'
import { PrimaryOutlineButton } from './styles'

const ButtonsContainer = styled(FlexGap).attrs({ flexWrap: 'wrap', gap: '4px' })`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 1px;
  width: fit-content;

  box-shadow: ${({ theme }) => theme.shadows.inset};
`

const StyledButton = styled(Button)`
  height: 48px;
  padding: 0 8px;
  ${({ theme }) => theme.mediaQueries.md} {
    height: 52px;
    padding: 0 16px;
  }
`

const StyledVerticalDivider = styled(VerticalDivider).attrs(({ theme }) => ({ bg: theme.colors.inputSecondary }))`
  margin: 0 4px;
`

export enum SlippageError {
  InvalidInput = 'InvalidInput',
  RiskyLow = 'RiskyLow',
  RiskyHigh = 'RiskyHigh',
  RiskyVeryHigh = 'RiskyVeryHigh',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
const THREE_DAYS_IN_SECONDS = 60 * 60 * 24 * 3

const DEFAULT_TXN_DEADLINE = 20 // In Minutes

export const DEFAULT_SLIPPAGE_TOLERANCE = 50

export const SlippageTabsComponent = ({
  slippageTolerance,
  setSlippageTolerance,
  isAutoSlippageEnabled,
  setIsAutoSlippageEnabled,
}: {
  slippageTolerance: number
  setSlippageTolerance: (val: number) => void
  isAutoSlippageEnabled?: boolean
  setIsAutoSlippageEnabled?: (val: boolean) => void
}) => {
  const [slippageInput, setSlippageInput] = useState('')
  const { isMobile } = useMatchBreakpoints()
  const { t } = useTranslation()

  const isShowAutoSlippage =
    typeof setIsAutoSlippageEnabled !== 'undefined' && typeof isAutoSlippageEnabled !== 'undefined'

  const slippageInputIsValid =
    slippageInput === '' || (slippageTolerance / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2)

  let slippageError: SlippageError | undefined
  if (slippageInput !== '' && !slippageInputIsValid) {
    slippageError = SlippageError.InvalidInput
  } else if (slippageInputIsValid && slippageTolerance < 50) {
    // Slippage < 0.5%
    slippageError = SlippageError.RiskyLow
  } else if (slippageInputIsValid && slippageTolerance > 2000) {
    // Slippage > 20%
    slippageError = SlippageError.RiskyVeryHigh
  } else if (slippageInputIsValid && slippageTolerance > 100) {
    // Slippage > 1%
    slippageError = SlippageError.RiskyHigh
  } else {
    slippageError = undefined
  }

  const parseCustomSlippage = (value: string) => {
    if (value === '' || inputRegex.test(escapeRegExp(value))) {
      setSlippageInput(value)

      try {
        const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString())
        if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
          setSlippageTolerance(valueAsIntFromRoundedFloat)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <FlexGap flexDirection="column" gap="24px">
      <Flex flexDirection="column">
        <ButtonsContainer style={{ flexWrap: isMobile ? 'nowrap' : 'wrap' }}>
          {isShowAutoSlippage && (
            <StyledButton
              scale="sm"
              onClick={() => {
                setSlippageInput('')
                setIsAutoSlippageEnabled?.(true)
              }}
              variant={isAutoSlippageEnabled ? 'subtle' : 'light'}
            >
              {t('Auto')}
            </StyledButton>
          )}
          <StyledButton
            scale="sm"
            onClick={() => {
              setSlippageInput('')
              setSlippageTolerance(10)
              setIsAutoSlippageEnabled?.(false)
            }}
            variant={slippageTolerance === 10 && !isAutoSlippageEnabled ? 'subtle' : 'light'}
          >
            0.1%
          </StyledButton>
          <StyledButton
            scale="sm"
            onClick={() => {
              setSlippageInput('')
              setSlippageTolerance(50)
              setIsAutoSlippageEnabled?.(false)
            }}
            variant={slippageTolerance === 50 && !isAutoSlippageEnabled ? 'subtle' : 'light'}
          >
            0.5%
          </StyledButton>
          <StyledButton
            scale="sm"
            onClick={() => {
              setSlippageInput('')
              setSlippageTolerance(100)
              setIsAutoSlippageEnabled?.(false)
            }}
            variant={slippageTolerance === 100 && !isAutoSlippageEnabled ? 'subtle' : 'light'}
          >
            1.0%
          </StyledButton>
          <Flex ml="8px" pr="8px" alignItems="center">
            <Box position="relative" width="82px">
              <Input
                scale="md"
                inputMode="decimal"
                pattern="^[0-9]*[.,]?[0-9]{0,2}$"
                placeholder={isAutoSlippageEnabled ? 'Auto' : (slippageTolerance / 100).toFixed(2)}
                value={slippageInput}
                onBlur={() => {
                  parseCustomSlippage((slippageTolerance / 100).toFixed(2))
                }}
                onChange={(event) => {
                  if (isAutoSlippageEnabled) {
                    setIsAutoSlippageEnabled?.(false)
                  }
                  if (event.currentTarget.validity.valid) {
                    parseCustomSlippage(event.target.value.replace(/,/g, '.'))
                  }
                }}
                isWarning={!slippageInputIsValid}
                isSuccess={![10, 50, 100].includes(slippageTolerance)}
                style={{
                  paddingRight: '28px',
                }}
              />
              <Flex position="absolute" right="8px" top="8px" alignItems="center">
                <StyledVerticalDivider />
                <Text color="textSubtle"> %</Text>
              </Flex>
            </Box>
          </Flex>
        </ButtonsContainer>

        {!isAutoSlippageEnabled && !!slippageError && (
          <Message
            mt="8px"
            variant={
              slippageError === SlippageError.InvalidInput
                ? 'primary'
                : slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh
                ? 'warning'
                : 'danger'
            }
          >
            <Text>
              {slippageError === SlippageError.InvalidInput
                ? t('Enter a valid slippage percentage')
                : slippageError === SlippageError.RiskyLow
                ? t('Your transaction may fail')
                : t('Your transaction may be frontrun')}
              .<br />
              <Text
                as="button"
                role="button"
                onClick={() => {
                  setSlippageInput('')
                  setSlippageTolerance(DEFAULT_SLIPPAGE_TOLERANCE)
                }}
                style={{
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  display: 'inline-block',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
                bold
              >
                {t('Reset slippage settings')}
              </Text>{' '}
              {t('to avoid potential loss')}.
            </Text>
          </Message>
        )}
      </Flex>
    </FlexGap>
  )
}

export const TxDeadlintSetting = () => {
  const { t } = useTranslation()

  const [ttl, setTTL] = useUserTransactionTTL()
  const [deadlineError, setDeadlineError] = useState<DeadlineError | undefined>()

  const [deadlineInput, setDeadlineInput] = useState('')
  const deadlineInputIsValid =
    deadlineInput === '' || (ttl !== undefined && (Number(ttl) / 60).toString() === deadlineInput)

  const isShowTTL = typeof setTTL !== 'undefined' && typeof ttl !== 'undefined'

  const parseCustomDeadline = (value: string) => {
    try {
      const valueAsInt: number = Number.parseInt(value) * 60
      if (!Number.isNaN(valueAsInt) && valueAsInt > 60 && valueAsInt < THREE_DAYS_IN_SECONDS) {
        setTTL?.(valueAsInt)
      } else {
        setDeadlineError(DeadlineError.InvalidInput)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (deadlineInput !== '' && !deadlineInputIsValid) {
      setDeadlineError(DeadlineError.InvalidInput)
    } else {
      setDeadlineError(undefined)
    }
  }, [deadlineInput, deadlineInputIsValid])

  return (
    isShowTTL && (
      <Box>
        <Flex alignItems="center">
          <Text>{t('Tx deadline')}</Text>
          <QuestionHelper
            text={t('Your transaction will revert if it is left confirming for longer than this time.')}
            placement="top"
            ml="4px"
          />
        </Flex>
        <Flex alignItems="center">
          <Box position="relative" width="128px" mt="4px">
            <Input
              scale="md"
              inputMode="numeric"
              pattern="^[0-9]+$"
              isWarning={!!deadlineError}
              placeholder={(Number(ttl) / 60).toString()}
              value={deadlineInput}
              onChange={(event) => {
                if (event.currentTarget.validity.valid) {
                  setDeadlineInput(event.target.value)
                }
              }}
              onBlur={(event) => {
                if (event.currentTarget.validity.valid) {
                  parseCustomDeadline(event.target.value)
                }
              }}
              style={{
                paddingRight: '48px',
              }}
            />
            <Flex position="absolute" right="8px" top="8px" alignItems="center">
              <StyledVerticalDivider />
              <Text color="textSubtle">{t('Mins')}</Text>
            </Flex>
          </Box>
          <PrimaryOutlineButton
            ml="8px"
            mt="3px"
            variant="text"
            scale="sm"
            onClick={() => {
              setDeadlineInput('')
              parseCustomDeadline(DEFAULT_TXN_DEADLINE.toString())
            }}
          >
            {t('Reset')}
          </PrimaryOutlineButton>
        </Flex>
      </Box>
    )
  )
}

const SlippageTabs = () => {
  const [userSlippageTolerance, setUserSlippageTolerance] = useUserSlippage()
  const [isAutoSlippageEnabled, setIsAutoSlippageEnabled] = useAutoSlippageEnabled()

  return (
    <SlippageTabsComponent
      slippageTolerance={userSlippageTolerance}
      setSlippageTolerance={setUserSlippageTolerance}
      isAutoSlippageEnabled={isAutoSlippageEnabled}
      setIsAutoSlippageEnabled={setIsAutoSlippageEnabled}
    />
  )
}
export default SlippageTabs
