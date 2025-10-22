import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  Card,
  CheckmarkCircleIcon,
  ColumnCenter,
  FlexGap,
  RowBetween,
  Spinner,
  Text,
  useToast,
} from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { TokenAmountSection } from 'components/TokenAmountSection'
import { useEffect } from 'react'

import { useClaimGift } from '../hooks/useClaimGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { useClaimGiftContext } from '../providers/ClaimGiftProvider'
import { GiftApiStatus } from '../types'
import { convertCodeHash } from '../utils/convertCodeHash'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { GiftInfoAddress } from './GiftInfoDetail'

export const ClaimGiftConfirmView = () => {
  const { code, setCode } = useClaimGiftContext()
  const { t } = useTranslation()
  const { toastSuccess } = useToast()

  const { data: giftInfo, isLoading } = useGetGiftByCodeHash({
    codeHash: convertCodeHash(code),
  })

  const {
    mutate: claimGift,
    isPending,
    isError,
    error,
    data: claimGiftData,
  } = useClaimGift({
    onSuccess: () => {
      toastSuccess(t('Claim Gift Successfully'))
    },
  })

  useEffect(() => {
    if (code && claimGiftData?.status === GiftApiStatus.SUCCESS) {
      // In case user click back button after claim gift, the code will be reset
      return () => setCode('')
    }

    return () => {}
  }, [claimGiftData?.status, code, setCode])

  const handleClaim = () => {
    if (code) {
      claimGift({ code })
    }
  }

  if (!giftInfo || isLoading) {
    return (
      <ColumnCenter>
        <Spinner />
      </ColumnCenter>
    )
  }

  const hasIncludeStarterGas =
    giftInfo.currencyAmount && giftInfo.currencyAmount.greaterThan(0) && giftInfo.nativeCurrencyAmount.greaterThan(0)

  const isOnlyNative = !giftInfo.currencyAmount && giftInfo.nativeCurrencyAmount.greaterThan(0)

  return (
    <ColumnCenter>
      {hasIncludeStarterGas ? (
        <FlexGap mb="16px" width="100%" flexDirection="column" gap="8px">
          {giftInfo.currencyAmount && (
            <Card>
              <Box p="8px">
                <CurrencyAmountGiftDisplay currencyAmount={giftInfo.currencyAmount} />
              </Box>
            </Card>
          )}
          <Card>
            <Box p="8px">
              <CurrencyAmountGiftDisplay currencyAmount={giftInfo.nativeCurrencyAmount} />
            </Box>
          </Card>
        </FlexGap>
      ) : (
        <TokenAmountSection tokenAmount={isOnlyNative ? giftInfo.nativeCurrencyAmount : giftInfo.currencyAmount!} />
      )}

      <Card mb="16px" style={{ width: '100%' }}>
        <FlexGap flexDirection="column" gap="4px" p="16px">
          {giftInfo.creatorAddress && <GiftInfoAddress text={t('Created by:')} address={giftInfo.creatorAddress} />}
          {giftInfo.timestamp && (
            <RowBetween>
              <Text color="textSubtle" small>
                {t('Created at:')}
              </Text>
              <Text small>
                {formatTimestamp(new Date(giftInfo.timestamp).getTime(), {
                  precision: Precision.MINUTE,
                })}
              </Text>
            </RowBetween>
          )}
          {giftInfo.expiryTimestamp && (
            <RowBetween>
              <Text color="textSubtle" small>
                {t('Expires on:')}
              </Text>
              <Text small>
                {formatTimestamp(new Date(giftInfo.expiryTimestamp).getTime(), {
                  precision: Precision.MINUTE,
                })}
              </Text>
            </RowBetween>
          )}
        </FlexGap>
      </Card>

      {isError && (
        <Box mb="16px" color="failure">
          {error?.message || t('Failed to claim gift')}
        </Box>
      )}

      {claimGiftData?.status === GiftApiStatus.SUCCESS ? (
        <CheckmarkCircleIcon color="success" width="40px" />
      ) : (
        <Button
          onClick={() => {
            handleClaim()
          }}
          width="100%"
          disabled={!code || isPending}
          isLoading={isPending}
        >
          {isPending ? t('Claiming...') : t('Claim')}
        </Button>
      )}
    </ColumnCenter>
  )
}
