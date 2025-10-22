import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { CurrencyAmount, type Currency } from '@pancakeswap/swap-sdk-core'
import { Box, Button, FlexGap, Loading, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { NumberDisplay, SwapUIV2 } from '@pancakeswap/widgets-internal'
import { BigNumber } from 'bignumber.js'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useRouter } from 'next/router'

import { logGTMIfoDepositEvent } from 'utils/customGTMEventTracking'
import { useAccount } from 'wagmi'
import { useSetAtom } from 'jotai'
import { updateIfoVer } from 'views/Cakepad/atom/ifoVersionAtom'
import { useIFODuration } from '../../hooks/ifo/useIFODuration'
import { useIFODepositCallback } from '../../hooks/ifo/useIFODepositCallback'
import IfoSubmittingCard from '../IfoSubmittingCard'
import useIfo from '../../hooks/useIfo'
import BalanceRow from './BalanceRow'
import PercentageSelector from './PercentageSelector'
import MaxDepositExceed from './MaxDepositExceed'

export const formatDollarAmount = (amount: number) => {
  if (amount > 0 && amount < 0.01) {
    return '<0.01'
  }
  return formatNumber(amount)
}

const StyledText = styled(Text)`
  font-size: 14px;
  font-family: Kanit;
  line-height: 150%;
`

interface IfoDepositFormProps {
  pid: number
  onDismiss?: () => void
}

export const IfoDepositForm: React.FC<IfoDepositFormProps> = ({ pid, onDismiss }) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const safeValue = new BigNumber(value).isFinite() ? value : ''

  const { info, pools, users } = useIfo()
  const duration = info?.duration ?? 0
  const poolInfo = pools?.[pid]
  const userStatus = users[pid]
  const stakeCurrency = userStatus?.stakedAmount?.currency ?? poolInfo?.stakeCurrency
  const maxStakePerUser = useMemo(() => {
    if (!poolInfo?.stakeCurrency) return undefined
    return CurrencyAmount.fromRawAmount(poolInfo.stakeCurrency, poolInfo.capPerUserInLP)
  }, [poolInfo])

  const { address: account } = useAccount()
  const inputBalance = useCurrencyBalance(account ?? undefined, stakeCurrency ?? undefined)
  const balance = stakeCurrency ? formatAmount(inputBalance, 6) : undefined
  const { deposit, status } = useIFODepositCallback()
  const router = useRouter()
  const [submittedDeposit, setSubmittedDeposit] = useState<CurrencyAmount<Currency> | undefined>()

  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])
  const update = useSetAtom(updateIfoVer)

  const maxDepositAmount = useMemo(() => {
    if (!maxAmountInput) return undefined
    if (maxStakePerUser && !maxStakePerUser.equalTo(0)) {
      const stakedAmount = userStatus?.stakedAmount ?? CurrencyAmount.fromRawAmount(maxStakePerUser.currency, 0)
      const remainingCap = maxStakePerUser.subtract(stakedAmount)
      return remainingCap.lessThan(maxAmountInput) ? remainingCap : maxAmountInput
    }
    return maxAmountInput
  }, [maxAmountInput, maxStakePerUser, userStatus?.stakedAmount])

  const getPercentAmount = useCallback(
    (percent: number) => {
      return maxDepositAmount!.multiply(new Percent(percent, 100))
    },
    [maxDepositAmount],
  )

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxDepositAmount) {
        const percentAmount = getPercentAmount(percent)
        setValue(percentAmount.toExact())
      }
    },
    [maxDepositAmount, getPercentAmount],
  )

  const handleMaxInput = useCallback(() => {
    if (maxDepositAmount) {
      setValue(maxDepositAmount.toExact())
    }
  }, [maxDepositAmount])

  const tokenBalanceMultiplier = useMemo(
    () => new BigNumber(10).pow(stakeCurrency?.decimals ?? 18),
    [stakeCurrency?.decimals],
  )

  const depositAmount =
    stakeCurrency && safeValue !== ''
      ? CurrencyAmount.fromRawAmount(
          stakeCurrency,
          new BigNumber(safeValue ?? 0).times(tokenBalanceMultiplier).toFixed(0),
        )
      : undefined

  const totalDepositedAmount = stakeCurrency
    ? CurrencyAmount.fromRawAmount(stakeCurrency, userStatus?.stakedAmount?.quotient ?? 0).add(
        CurrencyAmount.fromRawAmount(stakeCurrency, depositAmount?.quotient ?? 0),
      )
    : undefined

  const maxDepositExceeded = useMemo(() => {
    return maxStakePerUser && !maxStakePerUser.equalTo(0) && totalDepositedAmount?.greaterThan(maxStakePerUser)
  }, [maxStakePerUser, totalDepositedAmount])

  const isUserInsufficientBalance = useMemo(() => {
    if (depositAmount && inputBalance) {
      return depositAmount.greaterThan(inputBalance)
    }
    return false
  }, [depositAmount, inputBalance])

  const amountInDollar = useStablecoinPriceAmount(
    stakeCurrency ?? undefined,
    safeValue !== undefined && Number.isFinite(+safeValue) ? +safeValue : undefined,
    {
      enabled: Boolean(safeValue !== undefined && Number.isFinite(+safeValue)),
    },
  )
  const isInputloading = inputBalance === undefined

  const handleConfirmDeposit = async () => {
    if (depositAmount) {
      setSubmittedDeposit(depositAmount)
      const hash = await deposit(pid, depositAmount, () => {
        router.back()
        requestAnimationFrame(() => {
          update()
        })
      })
      if (hash) {
        logGTMIfoDepositEvent()
      }
      setValue('')
    }
  }

  const durationText = useIFODuration(duration)

  const inputRef = useRef<HTMLDivElement>(null)

  const handleInputFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  // issue: https://issues.chromium.org/issues/41177736
  // android may not trigger blur event when keyboard hide
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isSoftKeyboardOpen =
      Math.min(window.innerWidth / window.screen.width, window.innerHeight / window.screen.height) < 0.7
    if (
      document.activeElement?.tagName === 'INPUT' &&
      document.activeElement?.id === `ifoStakeCurrency${stakeCurrency?.symbol}` &&
      !isSoftKeyboardOpen
    ) {
      ;(document.activeElement as HTMLInputElement).blur()
    }
  }, [stakeCurrency?.symbol])

  useEffect(() => {
    if (status === 'IDLE') {
      setSubmittedDeposit(undefined)
    }
    return undefined
  }, [status, router])

  if (status === 'PENDING' || status === 'CONFIRMING' || status === 'CONFIRMED') {
    return submittedDeposit ? <IfoSubmittingCard deposit={submittedDeposit} /> : null
  }

  return (
    <FlexGap flexDirection="column" gap="8px" ref={inputRef} width="100%">
      <SwapUIV2.CurrencyInputPanelSimplify
        id={`ifoStakeCurrency${stakeCurrency?.symbol ?? ''}`}
        disabled={false}
        error={maxDepositExceeded}
        value={value}
        placeholder="0.00"
        onInputFocus={handleInputFocus}
        onUserInput={setValue}
        top={
          <BalanceRow
            currency={stakeCurrency}
            balance={balance}
            isUserInsufficientBalance={isUserInsufficientBalance}
            onMax={handleMaxInput}
          />
        }
        bottom={
          isInputloading || Number.isFinite(amountInDollar) ? (
            <Box position="absolute" bottom="12px" right="0px">
              <FlexGap justifyContent="flex-end" mr="1rem">
                <FlexGap maxWidth={['120px', '160px', '200px', '240px']}>
                  {isInputloading ? (
                    <Loading width="14px" height="14px" />
                  ) : Number.isFinite(amountInDollar) ? (
                    <>
                      <Text fontSize="14px" color="textSubtle" ellipsis>
                        {`~${amountInDollar && formatDollarAmount(amountInDollar)}`}
                      </Text>
                      <Text ml="4px" fontSize="14px" color="textSubtle">
                        USD
                      </Text>
                    </>
                  ) : null}
                </FlexGap>
              </FlexGap>
            </Box>
          ) : null
        }
      />
      <PercentageSelector
        maxAmountInput={maxDepositAmount}
        value={safeValue}
        onPercent={handlePercentInput}
        getPercentAmount={getPercentAmount}
      />
      <MaxDepositExceed show={Boolean(maxDepositExceeded)} />
      <FlexGap flexDirection="column" gap="8px">
        <FlexGap justifyContent="space-between">
          <StyledText color="textSubtle">{t('Duration')}</StyledText>
          <StyledText color="text">{durationText}</StyledText>
        </FlexGap>
        {maxStakePerUser && !maxStakePerUser.equalTo(0) && (
          <FlexGap justifyContent="space-between">
            <StyledText color="textSubtle">{t('Max Deposit')}</StyledText>
            <StyledText color="text">
              <NumberDisplay
                value={maxStakePerUser.toExact()}
                suffix={` ${stakeCurrency?.symbol ?? ''}`}
                fontSize="14px"
                lineHeight="150%"
              />
            </StyledText>
          </FlexGap>
        )}
        {userStatus?.stakedAmount?.greaterThan(0) ? (
          <FlexGap justifyContent="space-between">
            <StyledText color="textSubtle">{t('Subscribed')}</StyledText>
            <StyledText color="text">
              <NumberDisplay
                value={userStatus?.stakedAmount?.toExact()}
                suffix={` ${stakeCurrency?.symbol ?? ''}`}
                fontSize="14px"
                lineHeight="150%"
              />
            </StyledText>
          </FlexGap>
        ) : null}
        <Button
          disabled={
            info?.status !== 'live' ||
            safeValue === '' ||
            !depositAmount ||
            depositAmount.equalTo(0) ||
            isUserInsufficientBalance ||
            maxDepositExceeded
          }
          width="100%"
          onClick={handleConfirmDeposit}
        >
          {t('Confirm Deposit')}
        </Button>
        {onDismiss && (
          <Button mt="4px" width="100%" variant="secondary" onClick={onDismiss}>
            {t('Cancel')}
          </Button>
        )}
      </FlexGap>
    </FlexGap>
  )
}
