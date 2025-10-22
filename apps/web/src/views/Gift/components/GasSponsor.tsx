import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, Percent } from '@pancakeswap/sdk'
import {
  BalanceInput,
  Box,
  Card,
  Checkbox,
  Flex,
  FlexGap,
  LazyAnimatePresence,
  RowBetween,
  Text,
  domAnimation,
} from '@pancakeswap/uikit'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { CurrencyLogo, SwapUIV2, truncateDecimals } from '@pancakeswap/widgets-internal'
import { BulletList } from 'components/BulletList'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { useGetNativeTokenBalance } from 'hooks/useTokenBalance'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useSendGiftContext } from '../providers/SendGiftProvider'

const StyledRow = styled(RowBetween)`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 8px;
  border-radius: 16px;
`

function NativeAmountInput({ tokenChainId }: { tokenChainId: number }) {
  const { setNativeAmount, nativeAmount, isUserInsufficientBalance } = useSendGiftContext()
  const nativeCurrency = useNativeCurrency(tokenChainId)
  const { balance: nativeCurrencyBalance } = useGetNativeTokenBalance(tokenChainId)
  const [inputValue, setInputValue] = useState(nativeAmount?.toExact() || '')

  const { t } = useTranslation()

  // Sync input value with context nativeAmount
  useEffect(() => {
    if (inputValue) {
      const amount = tryParseAmount(inputValue, nativeCurrency)
      setNativeAmount(amount)
    } else {
      setInputValue('')
      setNativeAmount(undefined)
    }
  }, [inputValue, setNativeAmount, nativeCurrency])

  const handleAmountChange = useCallback((value: string) => {
    setInputValue(truncateDecimals(value))
  }, [])

  const tokenBalance = CurrencyAmount.fromRawAmount(nativeCurrency, nativeCurrencyBalance.toString())

  // NOTE: Copy logic from SendAssetForm.tsx
  const [isInputFocus, setIsInputFocus] = useState(false)
  const isInsufficientBalance = false

  const handleUserInputBlur = useCallback(() => {
    setTimeout(() => setIsInputFocus(false), 300)
  }, [])

  const handleUserInputFocus = useCallback(() => {
    setIsInputFocus(true)
  }, [])

  const handlePercentInput = useCallback(
    (percent: number) => {
      if (tokenBalance) {
        handleAmountChange(tokenBalance.multiply(new Percent(percent, 100)).toExact())
      }
    },
    [tokenBalance, handleAmountChange],
  )

  const handleMaxInput = useCallback(() => {
    handlePercentInput(100)
  }, [handlePercentInput])

  const formattedUsdValue = useStablecoinPriceAmount(nativeCurrency, parseFloat(inputValue))

  return (
    <>
      <Box position="relative" top="-24px">
        <LazyAnimatePresence mode="wait" features={domAnimation}>
          {tokenBalance ? (
            !isInputFocus ? (
              <SwapUIV2.WalletAssetDisplay
                isUserInsufficientBalance={isInsufficientBalance}
                balance={tokenBalance.toSignificant(6)}
                onMax={handleMaxInput}
              />
            ) : (
              <SwapUIV2.AssetSettingButtonList onPercentInput={handlePercentInput} />
            )
          ) : null}
        </LazyAnimatePresence>
      </Box>
      <StyledRow>
        <FlexGap alignItems="center" gap="8px">
          <CurrencyLogo currency={nativeCurrency} size="40px" />
          <Text fontSize="16px" fontWeight={600}>
            {nativeCurrency.symbol}
          </Text>
        </FlexGap>

        <BalanceInput
          width="120px"
          value={inputValue}
          onUserInput={handleAmountChange}
          onFocus={handleUserInputFocus}
          onBlur={handleUserInputBlur}
          placeholder="0.0"
          currencyValue={formattedUsdValue ? `${formatDollarAmount(formattedUsdValue)}` : ''}
        />

        {isUserInsufficientBalance && (
          <Flex justifyContent="flex-end" width="100%">
            <Text fontSize="12px" color="textSubtle">
              {t('Insufficient balance')}
            </Text>
          </Flex>
        )}
      </StyledRow>
    </>
  )
}

export const GasSponsor = ({ tokenChainId }: { tokenChainId: number }) => {
  const { includeStarterGas, setIncludeStarterGas } = useSendGiftContext()
  const { t } = useTranslation()

  const msg = includeStarterGas ? (
    <Text mb="24px" fontSize="12px">
      {t(
        'Add a small amount of the native token to help your recipient begin their on-chain journey right after claiming.',
      )}
    </Text>
  ) : (
    <BulletList>
      <li>
        <Text fontSize="12px" display="inline">
          {t(`Claiming is gas-free for the recipient, it's a fixed amount included in the gift.`)}
        </Text>
      </li>
      <li>
        <Text fontSize="12px" display="inline">
          {t('Extra gas is added to help the recipient take on-chain actions after claiming.')}
        </Text>
      </li>
    </BulletList>
  )

  return (
    <Card>
      <Box padding="16px">
        <Flex as="label" htmlFor="hide-close-positions" alignItems="center" mb="4px">
          <Checkbox
            id="include-starter-gas"
            scale="sm"
            name="confirmed"
            type="checkbox"
            checked={includeStarterGas}
            onChange={() => setIncludeStarterGas(!includeStarterGas)}
          />
          <Text ml="8px" fontSize="14px" fontWeight={600}>
            {t('Include Starter Gas')}
          </Text>
        </Flex>
        {msg}

        {includeStarterGas && <NativeAmountInput tokenChainId={tokenChainId} />}
      </Box>
    </Card>
  )
}
