import { useTranslation } from '@pancakeswap/localization'
import { Button, CheckmarkIcon, FlexGap, InfoIcon, SwapLoading, Text, useTooltip } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import ConnectW3WButton from 'components/ConnectW3WButton'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import useTheme from 'hooks/useTheme'
import { logGTMIdoConnectWalletEvent } from 'utils/customGTMEventTracking'
import { useCurrentIDOConfig } from 'views/Idos/hooks/ido/useCurrentIDOConfig'
import { useIDOClaimCallback } from 'views/Idos/hooks/ido/useIDOClaimCallback'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDOCurrencies } from 'views/Idos/hooks/ido/useIDOCurrencies'
import type { IDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { useAccount } from 'wagmi'
import { formatDollarAmount } from './IdoDepositButton'

export const ClaimDisplay: React.FC<{
  userStatus: IDOUserStatus | undefined
  pid: number
}> = ({ userStatus, pid }) => {
  const { t } = useTranslation()
  const { claim, isPending: isLoading } = useIDOClaimCallback()
  const claimableAmount = userStatus?.claimableAmount?.toSignificant(6)
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()
  const stakeCurrency = pid === 0 ? stakeCurrency0 : stakeCurrency1
  const { status } = useIDOConfig()
  const { icon } = useCurrentIDOConfig() ?? {}
  const amountInDollar = useStablecoinPriceAmount(
    offeringCurrency ?? undefined,
    claimableAmount !== undefined && Number.isFinite(+claimableAmount) ? +claimableAmount : undefined,
  )
  const refundAmount = userStatus?.stakeRefund?.toSignificant(6)
  const hasRefund = userStatus?.stakeRefund?.greaterThan(0)

  const refundInDollar = useStablecoinPriceAmount(
    stakeCurrency ?? undefined,
    refundAmount !== undefined && Number.isFinite(+refundAmount) ? +refundAmount : undefined,
  )

  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'When the sale is oversubscribed, deposit that were not used is being refunded. You may withdraw together when claiming.',
    ),
    {
      placement: 'top',
    },
  )
  const userClaimed = userStatus?.claimed

  const { isDark } = useTheme()
  const { address: account } = useAccount()
  const handleConnectWallet = (e) => {
    logGTMIdoConnectWalletEvent(status === 'coming_soon')
  }
  return (
    <>
      {userHasStaked ? (
        <FlexGap flexDirection="column" gap="8px">
          <FlexGap gap="8px" justifyContent="space-between" alignItems="center">
            <FlexGap flexDirection="column">
              <FlexGap gap="8px" alignItems="center">
                {stakeCurrency && <CurrencyLogo size="24px" currency={stakeCurrency} />}
                <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                  {stakeCurrency?.symbol} {t('Pool')}
                </Text>
              </FlexGap>
              <FlexGap flexDirection="column" mt="8px">
                <Text textTransform="uppercase" color="secondary" fontSize="12px" bold>
                  {offeringCurrency?.symbol} {t('allocated')}
                </Text>
                <Text fontSize="20px" bold lineHeight="30px">
                  {claimableAmount}
                </Text>
                <FlexGap>
                  {Number.isFinite(amountInDollar) ? (
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
            </FlexGap>
            <Button
              onClick={() => {
                if (!userClaimed) claim(pid)
              }}
              width={userClaimed ? '48px' : undefined}
              variant={userClaimed ? 'success' : undefined}
              isLoading={isLoading}
            >
              {userClaimed ? (
                <CheckmarkIcon color={isDark ? '#000000' : '#FFFFFF'} />
              ) : (
                <>
                  {t('Claim')} {isLoading ? <SwapLoading ml="3px" /> : null}
                </>
              )}
            </Button>
          </FlexGap>
          <FlexGap justifyContent="space-between" mt="8px">
            <Text color="textSubtle">{t('Subscribed')}</Text>
            <Text>
              {userStatus?.stakedAmount?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          {hasRefund && (
            <FlexGap justifyContent="space-between" alignItems="flex-start">
              <FlexGap gap="3px" alignItems="center">
                <Text color="textSubtle">{userStatus?.claimed ? t('Refunded') : t('Refund')}</Text>
                {userStatus?.claimed ? null : (
                  <FlexGap ref={targetRef}>
                    <InfoIcon width="14px" color="textSubtle" />
                    {tooltipVisible && tooltip}
                  </FlexGap>
                )}
              </FlexGap>
              <FlexGap flexDirection="column" alignItems="flex-end">
                <Text>
                  {userStatus?.stakeRefund?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
                </Text>
                <FlexGap>
                  {Number.isFinite(refundInDollar) ? (
                    <>
                      <Text fontSize="14px" color="textSubtle" ellipsis>
                        {`~${refundInDollar && formatDollarAmount(refundInDollar)}`}
                      </Text>
                      <Text ml="4px" fontSize="14px" color="textSubtle">
                        USD
                      </Text>
                    </>
                  ) : null}
                </FlexGap>
              </FlexGap>
            </FlexGap>
          )}
        </FlexGap>
      ) : (
        <FlexGap flexDirection="column" gap="8px">
          <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
            {stakeCurrency?.symbol} {t('Pool')}
          </Text>
          <FlexGap gap="8px" alignItems="center">
            {stakeCurrency && <CurrencyLogo size="40px" currency={stakeCurrency} />}
            {!account ? (
              <ConnectW3WButton width="100%" onClick={handleConnectWallet} />
            ) : (
              <Text fontSize="16px" color="textDisabled" bold>
                {t('You didn’t deposit')} {stakeCurrency?.symbol}
              </Text>
            )}
          </FlexGap>
        </FlexGap>
      )}
    </>
  )
}
