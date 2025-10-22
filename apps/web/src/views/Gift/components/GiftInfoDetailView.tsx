import { useTranslation } from '@pancakeswap/localization'
import { ChainId } from '@pancakeswap/chains'
import { Box, Button, Card, CheckmarkCircleIcon, Flex, FlexGap, Spinner } from '@pancakeswap/uikit'
import Divider from 'components/Divider'
import { SecondaryCard } from 'components/SecondaryCard'
import { useCallback, useContext } from 'react'

import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useCancelGift } from '../hooks/useCancelGift'
import { useGetGiftByCodeHash } from '../hooks/useGetGiftInfo'
import { CancelGiftContext } from '../providers/CancelGiftProvider'
import { GiftStatus } from '../types'
import { isExpired } from '../utils/isExpired'
import { CurrencyAmountGiftDisplay } from './CurrencyAmountGiftDisplay'
import { GiftInfoAddress, GiftInfoDescription, GiftInfoTimestamp } from './GiftInfoDetail'
import { GiftStatusTag } from './GiftStatusTag'

export const GiftInfoDetailView = () => {
  const { codeHash } = useContext(CancelGiftContext)
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const { switchNetwork } = useSwitchNetwork()

  const { cancelGift, isLoading: isLoadingCancelGift, txHash, error } = useCancelGift()

  const { data: giftInfo, isLoading: isLoadingGiftInfo } = useGetGiftByCodeHash({ codeHash })

  // Check if cancel was successful (transaction completed and has hash)
  const isCancelSuccessful = !isLoadingCancelGift && !!txHash && !error

  const handleCancelGift = useCallback(() => {
    if (chainId !== ChainId.BSC) {
      switchNetwork(ChainId.BSC)
    } else {
      cancelGift({ codeHash })
    }
  }, [chainId, switchNetwork, cancelGift])

  if (!giftInfo || isLoadingGiftInfo) {
    return (
      <Flex width="100%" py="24px" justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    )
  }

  const status =
    giftInfo.status === GiftStatus.PENDING && isExpired(giftInfo.expiryTimestamp) ? GiftStatus.EXPIRED : giftInfo.status

  const showNote = status === GiftStatus.CANCELLED || status === GiftStatus.EXPIRED || status === GiftStatus.UNCLAIMABLE

  return (
    <>
      {!showNote ? null : status === GiftStatus.EXPIRED ? (
        <GiftInfoDescription
          text={t('Gift Expired, Tokens Returned!')}
          description={t(
            'The gift has expired. The full amount, minus the claim gas fee, has been returned to your wallet.',
          )}
        />
      ) : status === GiftStatus.UNCLAIMABLE ? (
        <GiftInfoDescription
          text={t('Gift Failed to Claim')}
          description={t('The gift claim failed. You can cancel this gift to return the tokens to your wallet.')}
        />
      ) : (
        <GiftInfoDescription
          text={t('Gift Cancelled')}
          description={t(
            `You've cancelled this gift. The full amount, including the added gas fee, has been returned to your wallet.`,
          )}
        />
      )}
      {!showNote && (
        <SecondaryCard mb="16px">
          {giftInfo.currencyAmount && giftInfo.currencyAmount.greaterThan(0) && (
            <CurrencyAmountGiftDisplay currencyAmount={giftInfo.currencyAmount} />
          )}

          {giftInfo.currencyAmount &&
            giftInfo.currencyAmount.greaterThan(0) &&
            giftInfo.nativeCurrencyAmount.greaterThan(0) && (
              <Divider thin style={{ margin: '0 -16px', width: 'calc(100% + 32px)' }} />
            )}

          {giftInfo.nativeCurrencyAmount.greaterThan(0) && (
            <CurrencyAmountGiftDisplay currencyAmount={giftInfo.nativeCurrencyAmount} />
          )}
        </SecondaryCard>
      )}
      <Card mb="16px">
        <Box p="16px">
          {showNote && (
            <SecondaryCard mb="16px">
              {giftInfo.currencyAmount && giftInfo.currencyAmount.greaterThan(0) && (
                <CurrencyAmountGiftDisplay currencyAmount={giftInfo.currencyAmount} />
              )}

              {giftInfo.currencyAmount &&
                giftInfo.currencyAmount.greaterThan(0) &&
                giftInfo.nativeCurrencyAmount.greaterThan(0) && (
                  <Divider thin style={{ margin: '0 -16px', width: 'calc(100% + 32px)' }} />
                )}

              {giftInfo.nativeCurrencyAmount.greaterThan(0) && (
                <CurrencyAmountGiftDisplay currencyAmount={giftInfo.nativeCurrencyAmount} />
              )}
            </SecondaryCard>
          )}
          <Box mb="16px">
            <GiftStatusTag status={isCancelSuccessful ? GiftStatus.CANCELLED : status} />
          </Box>

          <FlexGap flexDirection="column" gap="8px">
            <GiftInfoTimestamp
              text={t('Gift created:')}
              timestamp={giftInfo.timestamp}
              toolipText={t('Date and time when gift was generated.')}
            />

            {status === GiftStatus.CLAIMED && giftInfo.claimTimeStamp && (
              <>
                <GiftInfoTimestamp
                  text={t('Gift claimed:')}
                  timestamp={giftInfo.claimTimeStamp}
                  toolipText={t('Date and time when gift was claimed.')}
                />
                <GiftInfoAddress
                  text={t('Claimed by:')}
                  address={giftInfo.claimerAddress}
                  toolipText={t('Wallet address of user who claimed gift.')}
                />
              </>
            )}

            {status === GiftStatus.CANCELLED && giftInfo.cancelTimeStamp && (
              <GiftInfoTimestamp text={t('Gift cancelled:')} timestamp={giftInfo.cancelTimeStamp} />
            )}

            {[GiftStatus.PENDING, GiftStatus.EXPIRED].includes(status) && (
              <GiftInfoTimestamp
                text={status === GiftStatus.EXPIRED ? t('Gift expired:') : t('Gift expires:')}
                toolipText={t('Date and time when gift will expire (default is 7 days).')}
                timestamp={giftInfo.expiryTimestamp}
              />
            )}
          </FlexGap>
        </Box>
      </Card>

      {isCancelSuccessful ? (
        <Flex width="100%" py="8px" justifyContent="center" alignItems="center">
          <CheckmarkCircleIcon color="success" width="40px" />
        </Flex>
      ) : (
        // if status is pending and expiryTimestamp is in the past, it is expired
        // but user might need to manually cancel the gift in case auto cancel is not working
        // Also show cancel button for UNCLAIMABLE status when claim fails
        (giftInfo.status === GiftStatus.PENDING || giftInfo.status === GiftStatus.UNCLAIMABLE) && (
          <Button
            onClick={handleCancelGift}
            variant="danger"
            width="100%"
            disabled={!codeHash || isLoadingCancelGift}
            isLoading={isLoadingCancelGift}
          >
            {chainId === ChainId.BSC ? (isLoadingCancelGift ? t('Cancelling...') : t('Cancel')) : t('Switch Network')}
          </Button>
        )
      )}
    </>
  )
}
