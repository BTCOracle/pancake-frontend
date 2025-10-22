import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import {
  AddIcon,
  Box,
  Button,
  Flex,
  FlexGap,
  Heading,
  Image,
  LazyAnimatePresence,
  Loading,
  ModalBody,
  ModalContainer,
  ModalV2,
  SwapLoading,
  Text,
  domAnimation,
  useModalV2,
  useTooltip,
} from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatBalance'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { CurrencyLogo, SwapUIV2 } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount } from 'wagmi'

import { getIsAndroid, isInBinance } from '@binance/w3w-utils'
import { ASSET_CDN } from 'config/constants/endpoints'
import { logGTMIdoDepositEvent } from 'utils/customGTMEventTracking'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDODuration } from 'views/Idos/hooks/ido/useIDODuration'
import type { IDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { VerifyStatus, useW3WAccountVerify } from 'views/Idos/hooks/w3w/useW3WAccountVerify'
import { useIDODepositCallback } from '../../hooks/ido/useIDODepositCallback'

export const formatDollarAmount = (amount: number) => {
  if (amount > 0 && amount < 0.01) {
    return '<0.01'
  }
  return formatNumber(amount)
}

export const IdoDepositButton: React.FC<{
  userStatus: IDOUserStatus | undefined
  pid: number
  type: 'add' | 'deposit'
}> = ({ userStatus, type, pid }) => {
  const { t } = useTranslation()
  const { onDismiss, onOpen, isOpen } = useModalV2()
  const { isOpen: isUnverifiedOpen, onOpen: onUnverifiedOpen, onDismiss: onUnverifiedDismiss } = useModalV2()
  const [value, setValue] = useState('')
  const isAndroid = getIsAndroid()
  const isBinance = isInBinance()

  const stakeCurrency = userStatus?.stakedAmount?.currency
  const { maxStakePerUsers, duration } = useIDOConfig()
  const maxStakePerUser = useMemo(() => {
    if (!stakeCurrency) return undefined
    if (maxStakePerUsers[0]?.currency.equals(stakeCurrency)) {
      return maxStakePerUsers[0]
    }
    return maxStakePerUsers[1]
  }, [maxStakePerUsers, stakeCurrency])

  const { address: account } = useAccount()
  const inputBalance = useCurrencyBalance(account ?? undefined, stakeCurrency ?? undefined)
  const balance = stakeCurrency ? formatAmount(inputBalance, 6) : undefined
  const { deposit, isPending: isLoading } = useIDODepositCallback()

  const maxAmountInput = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])

  const getPercentAmount = useCallback(
    (percent: number) => {
      return maxAmountInput.multiply(new Percent(percent, 100))
    },
    [maxAmountInput],
  )

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (maxAmountInput) {
        const percentAmount = getPercentAmount(percent)
        if (
          userStatus?.stakedAmount &&
          maxStakePerUser &&
          !maxStakePerUser.equalTo(0) &&
          percentAmount.greaterThan(maxStakePerUser.subtract(userStatus?.stakedAmount))
        ) {
          setValue(maxStakePerUser.subtract(userStatus?.stakedAmount).toExact())
        } else setValue(percentAmount.toExact())
      }
    },
    [maxAmountInput, getPercentAmount, userStatus?.stakedAmount, maxStakePerUser],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      setValue(maxAmountInput.toExact())
    }
  }, [maxAmountInput])
  const tokenBalanceMultiplier = useMemo(
    () => new BigNumber(10).pow(stakeCurrency?.decimals ?? 18),
    [stakeCurrency?.decimals],
  )
  const depositAmount =
    stakeCurrency && value !== ''
      ? CurrencyAmount.fromRawAmount(stakeCurrency, new BigNumber(value ?? 0).times(tokenBalanceMultiplier).toFixed(0))
      : undefined

  const totalDepositedAmount = stakeCurrency
    ? CurrencyAmount.fromRawAmount(stakeCurrency, userStatus?.stakedAmount?.quotient ?? 0).add(
        CurrencyAmount.fromRawAmount(stakeCurrency, depositAmount?.quotient ?? 0),
      )
    : undefined

  const maxDepositExceeded = useMemo(() => {
    return (
      maxStakePerUser &&
      !maxStakePerUser.equalTo(0) &&
      (totalDepositedAmount?.greaterThan(maxStakePerUser) || totalDepositedAmount?.equalTo(maxStakePerUser))
    )
  }, [maxStakePerUser, totalDepositedAmount])

  const isUserInsufficientBalance = useMemo(() => {
    if (depositAmount && inputBalance) {
      return depositAmount.greaterThan(inputBalance)
    }
    return false
  }, [depositAmount, inputBalance])

  const amountInDollar = useStablecoinPriceAmount(
    stakeCurrency ?? undefined,
    value !== undefined && Number.isFinite(+value) ? +value : undefined,
    {
      enabled: Boolean(value !== undefined && Number.isFinite(+value)),
    },
  )
  const isInputloading = inputBalance === undefined

  const { verifyStatus } = useW3WAccountVerify()

  const disabled = useMemo(() => {
    return maxDepositExceeded || isUserInsufficientBalance
  }, [maxDepositExceeded, isUserInsufficientBalance])

  const handleDeposit = useCallback(() => {
    if (verifyStatus === VerifyStatus.eligible) {
      onOpen()
    } else {
      onUnverifiedOpen()
    }
  }, [verifyStatus, onOpen, onUnverifiedOpen])

  useEffect(() => {
    if (verifyStatus === VerifyStatus.eligible && isUnverifiedOpen) {
      onUnverifiedDismiss()
    }
  }, [isUnverifiedOpen, onUnverifiedDismiss, verifyStatus])

  const { targetRef, tooltip } = useTooltip(
    <Text>
      {t(
        'Please choose a Binance keyless wallet. If you do not have one, go to Binance wallet management page to create one. ',
      )}
    </Text>,
    {
      placement: 'top-end',
      manualVisible: isUnverifiedOpen && verifyStatus !== VerifyStatus.restricted,
    },
  )

  const inputRef = useRef<HTMLDivElement>(null)

  const [minHeight, setMinHeight] = useState<string | undefined>(undefined)

  const handleInputFocus = useCallback(() => {
    if (inputRef.current) {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (isAndroid && isBinance) {
        setMinHeight('calc(100vh - 80px)')
      }
    }
  }, [isAndroid, isBinance])

  const handleCloseModal = useCallback(() => {
    onDismiss()
    setValue('')
  }, [onDismiss])

  const accountEllipsis = account ? `${account.substring(0, 2)}...${account.substring(account.length - 4)}` : null

  const [depositing, setDepositing] = useState(false)
  const handleConfirmDeposit = async () => {
    if (depositing) return
    if (verifyStatus !== VerifyStatus.eligible || !isBinance) {
      onUnverifiedOpen()
      return
    }
    if (depositAmount) {
      setDepositing(true)
      try {
        const hash = await deposit(pid, depositAmount, handleCloseModal)
        if (hash) {
          logGTMIdoDepositEvent()
        }
      } finally {
        setDepositing(false)
      }
    }
  }

  const durationText = useIDODuration(duration)

  useEffect(() => {
    if (account && isBinance && verifyStatus === VerifyStatus.ineligible) {
      onUnverifiedOpen()
    }
  }, [account, isBinance, verifyStatus, onUnverifiedOpen])

  // const { disconnectAsync } = useDisconnect()
  const handleUnverifiedDismiss = () => {
    onUnverifiedDismiss()
    // if (account && isBinance && verifyStatus === VerifyStatus.ineligible) {
    //   disconnectAsync()
    // }
  }

  // issue: https://issues.chromium.org/issues/41177736
  // android may not trigger blur event when keyboard hide
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isSoftKeyboardOpen =
      Math.min(window.innerWidth / window.screen.width, window.innerHeight / window.screen.height) < 0.7
    if (
      document.activeElement?.tagName === 'INPUT' &&
      document.activeElement?.id === `idoStakeCurrency${stakeCurrency?.symbol}` &&
      !isSoftKeyboardOpen
    ) {
      ;(document.activeElement as HTMLInputElement).blur()
    }
  }, [stakeCurrency?.symbol])

  return (
    <>
      <Button
        width={type === 'deposit' ? '100%' : undefined}
        onClick={handleDeposit}
        disabled={disabled}
        variant={type === 'add' ? 'secondary' : undefined}
      >
        {type === 'deposit' ? (
          <>
            {t('Deposit')} {stakeCurrency?.symbol ?? ''}
          </>
        ) : (
          <AddIcon color={maxDepositExceeded ? 'textDisabled' : 'primary'} />
        )}
      </Button>
      <ModalV2 isOpen={isOpen} title="Deposit" onDismiss={handleCloseModal} closeOnOverlayClick>
        <ModalContainer minHeight={minHeight}>
          <ModalBody p="16px" pt="28px">
            <FlexGap flexDirection="column" gap="8px" ref={inputRef}>
              <SwapUIV2.CurrencyInputPanelSimplify
                id={`idoStakeCurrency${stakeCurrency?.symbol ?? ''}`}
                disabled={false}
                error={maxStakePerUser && depositAmount?.greaterThan(maxStakePerUser) && !maxStakePerUser.equalTo(0)}
                value={value}
                placeholder="0.00"
                onInputFocus={handleInputFocus}
                onInputBlur={() => setMinHeight(undefined)}
                onUserInput={setValue}
                top={
                  <FlexGap flexDirection="column" gap="8px" width="100%">
                    <FlexGap justifyContent="space-between" alignItems="center">
                      <Text fontSize="12px" bold>
                        {t('Address')}
                      </Text>
                      <Text>{accountEllipsis}</Text>
                    </FlexGap>
                    <FlexGap justifyContent="space-between" alignItems="center" position="relative">
                      <Text fontSize="12px" bold>
                        {t('Deposit')}
                      </Text>
                      <LazyAnimatePresence mode="wait" features={domAnimation}>
                        {account ? (
                          <SwapUIV2.WalletAssetDisplay
                            isUserInsufficientBalance={isUserInsufficientBalance}
                            balance={balance}
                            onMax={handleMaxInput}
                          />
                        ) : null}
                      </LazyAnimatePresence>
                    </FlexGap>
                  </FlexGap>
                }
                inputLeft={
                  <FlexGap alignItems="center">
                    {stakeCurrency && <CurrencyLogo size="40px" currency={stakeCurrency} />}
                  </FlexGap>
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
              {maxStakePerUser && !maxStakePerUser.equalTo(0) && totalDepositedAmount?.greaterThan(maxStakePerUser) && (
                <Text color="failure">{t('Max stake per user exceeded')}</Text>
              )}
              <FlexGap>
                {maxAmountInput?.greaterThan(0) &&
                  [25, 50, 75, 100].map((percent) => {
                    const isAtCurrentPercent =
                      maxAmountInput && value !== '0' && value === getPercentAmount(percent).toExact()
                    return (
                      <Button
                        key={`btn_quickCurrency${percent}`}
                        data-dd-action-name={`Balance percent ${percent}`}
                        onClick={() => {
                          handlePercentInput(percent)
                        }}
                        scale="sm"
                        mr="5px"
                        width="100%"
                        variant={isAtCurrentPercent ? 'primary' : 'secondary'}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {percent === 100 ? t('Max.fill-max') : `${percent}%`}
                      </Button>
                    )
                  })}
              </FlexGap>
              <FlexGap flexDirection="column" gap="8px">
                <FlexGap justifyContent="space-between">
                  <Text color="textSubtle">{t('Project Duration')}</Text>
                  <Text>{durationText}</Text>
                </FlexGap>
                {maxStakePerUser && !maxStakePerUser.equalTo(0) && (
                  <FlexGap justifyContent="space-between">
                    <Text color="textSubtle">{t('Max. stake per user')}</Text>
                    <Text>
                      {maxStakePerUser?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
                    </Text>
                  </FlexGap>
                )}
                {userStatus?.stakedAmount?.greaterThan(0) ? (
                  <FlexGap justifyContent="space-between">
                    <Text color="textSubtle">{t('Subscribed')}</Text>
                    <Text>
                      {userStatus?.stakedAmount?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
                    </Text>
                  </FlexGap>
                ) : null}
                <Text color="textSubtle" fontSize="12px">
                  {t(
                    'Some Rules/ T&C context or information that user need to know before locking BNB/ participating in TGE, show here.',
                  )}
                </Text>
                <Button
                  disabled={
                    value === '' ||
                    !depositAmount ||
                    depositAmount.equalTo(0) ||
                    isUserInsufficientBalance ||
                    (maxStakePerUser &&
                      !maxStakePerUser.equalTo(0) &&
                      totalDepositedAmount?.greaterThan(maxStakePerUser))
                  }
                  width="100%"
                  isLoading={isLoading}
                  onClick={handleConfirmDeposit}
                >
                  {t('Confirm Deposit')} {isLoading ? <SwapLoading ml="3px" /> : null}
                </Button>
              </FlexGap>
            </FlexGap>
            {isAndroid && isBinance ? <Box height="60px" width="100%" /> : null}
          </ModalBody>
        </ModalContainer>
      </ModalV2>
      <ModalV2 isOpen={isUnverifiedOpen} title="" onDismiss={handleUnverifiedDismiss} closeOnOverlayClick>
        <>
          <Box style={{ position: 'fixed', right: '10px', top: '0' }} width="5px" height="5px" ref={targetRef} />
          {tooltip}
        </>
        <ModalContainer>
          {verifyStatus === VerifyStatus.restricted ? (
            <ModalBody p="16px" pt="30px">
              <FlexGap flexDirection="column" gap="16px">
                <Flex justifyContent="center">
                  <Image src={`${ASSET_CDN}/web/wallets/binance-w3w.png`} width={40} height={40} />
                </Flex>
                <Text>{account}</Text>
                <Text>{t('Due to regulatory requirements, you are not eligible to participate in.')}</Text>
              </FlexGap>
              {isAndroid && isBinance ? <Box height="60px" width="100%" /> : null}
            </ModalBody>
          ) : (
            <ModalBody p="16px" pt="30px">
              <Heading textAlign="center" fontSize="20px" bold mb="16px">
                {t('Binance Keyless Wallet')}
              </Heading>
              <FlexGap flexDirection="column" gap="16px">
                <Flex justifyContent="center">
                  <Image src={`${ASSET_CDN}/web/wallets/binance-w3w.png`} width={40} height={40} />
                </Flex>
                <Text width="100%" style={{ lineBreak: 'anywhere' }}>
                  {account}
                </Text>
                <Text>{t('This IDO subscription is exclusively available using the Binance Keyless Wallet.')}</Text>
              </FlexGap>
              {isAndroid && isBinance ? <Box height="60px" width="100%" /> : null}
            </ModalBody>
          )}
        </ModalContainer>
      </ModalV2>
    </>
  )
}
