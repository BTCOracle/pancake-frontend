import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, InfoIcon, Text, useTooltip } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import ConnectW3WButton from 'components/ConnectW3WButton'
import useTheme from 'hooks/useTheme'
import { useMemo } from 'react'
import { logGTMIdoConnectWalletEvent } from 'utils/customGTMEventTracking'
import type { IDOStatus } from 'views/Idos/hooks/ido/usdIDOStatus'
import { useCurrentIDOConfig } from 'views/Idos/hooks/ido/useCurrentIDOConfig'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDOCurrencies } from 'views/Idos/hooks/ido/useIDOCurrencies'
import type { IDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { VerifyStatus, useW3WAccountVerify } from 'views/Idos/hooks/w3w/useW3WAccountVerify'
import { useAccount } from 'wagmi'
import { ClaimDisplay } from './ClaimDisplay'
import { Divider } from './Divider'
import { IdoDepositButton } from './IdoDepositButton'
import { ComplianceCard, PreSaleEligibleCard, PreSaleInfoCard, SnapshotNotPassCard } from './PreSaleInfoCard'
import { StakedDisplay } from './StakedDisplay'

export const IdoStakeActionCard: React.FC<{
  pid: number
  userStatus: IDOUserStatus | undefined
  idoStatus: IDOStatus
}> = ({ userStatus, idoStatus, pid }) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { theme, isDark } = useTheme()
  const { verifyStatus, isLoading: isPendingVerify } = useW3WAccountVerify()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()

  const stakeCurrency = pid === 0 ? stakeCurrency0 : stakeCurrency1
  const userHasStaked = userStatus?.stakedAmount?.greaterThan(0)

  const { status, raiseAmounts, pricePerTokens, saleAmounts } = useIDOConfig()
  const { id, ineligibleContent } = useCurrentIDOConfig() ?? {}

  const [raiseAmount, pricePerToken, saleAmount] = useMemo(() => {
    if (pid === 0) {
      return [raiseAmounts[0], pricePerTokens[0], saleAmounts[0]]
    }

    return [raiseAmounts[1], pricePerTokens[1], saleAmounts[1]]
  }, [pid, raiseAmounts, pricePerTokens, saleAmounts])

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('This sale has been oversubscribed. You will get partial refund of the deposit.'),
    {
      placement: 'top',
    },
  )

  const handleConnectWallet = (e) => {
    logGTMIdoConnectWalletEvent(status === 'coming_soon')
  }

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background}>
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          {status === 'finished' ? (
            <ClaimDisplay userStatus={userStatus} pid={pid} />
          ) : userStatus?.stakedAmount?.greaterThan(0) ? (
            <StakedDisplay userStatus={userStatus} pid={pid} />
          ) : (
            <FlexGap flexDirection="column" gap="8px">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {stakeCurrency?.symbol} {t('Pool')}
              </Text>
              <FlexGap gap="8px" alignItems="center">
                {stakeCurrency && <CurrencyLogo size="40px" currency={stakeCurrency} />}

                {account && !isPendingVerify ? (
                  status === 'coming_soon' ? (
                    verifyStatus === VerifyStatus.eligible ? (
                      <PreSaleEligibleCard projectId={id} />
                    ) : verifyStatus === VerifyStatus.restricted ? (
                      <ComplianceCard />
                    ) : verifyStatus === VerifyStatus.snapshotNotPass ? (
                      <SnapshotNotPassCard projectId={id} ineligibleContent={ineligibleContent} />
                    ) : (
                      <PreSaleInfoCard />
                    )
                  ) : ['idle', 'live'].includes(status) && verifyStatus === VerifyStatus.snapshotNotPass ? (
                    <SnapshotNotPassCard projectId={id} />
                  ) : (
                    <IdoDepositButton userStatus={userStatus} type="deposit" pid={pid} />
                  )
                ) : (
                  <ConnectW3WButton width="100%" onClick={handleConnectWallet} />
                )}
              </FlexGap>
            </FlexGap>
          )}

          {userHasStaked && <Divider />}
          <FlexGap justifyContent="space-between" mt="8px">
            <Text color="textSubtle">
              {t('Sale Price per')} {offeringCurrency?.symbol ?? ''}
            </Text>
            <Text>
              {pricePerToken?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle">{t('Target Raise')}</Text>
            <Text>
              {raiseAmount?.toSignificant(6)} {stakeCurrency?.symbol ?? ''}
            </Text>
          </FlexGap>
          {(status === 'live' || status === 'finished') && (
            <>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Total committed')}</Text>
                <Text>
                  {idoStatus.currentStakedAmount?.toSignificant(6) ?? 0} {stakeCurrency?.symbol ?? ''}
                </Text>
              </FlexGap>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Status')}</Text>
                <FlexGap flexDirection="column" alignItems="flex-end">
                  <FlexGap gap="3px">
                    <Text>
                      {idoStatus.progress.toFixed(2)} % {idoStatus.progress.greaterThan(1) && '🎉'}
                    </Text>
                  </FlexGap>
                  {idoStatus.progress.greaterThan(1) && (
                    <FlexGap gap="3px">
                      <Text>{t('Oversubscribed')}</Text>
                      <FlexGap ref={targetRef}>
                        <InfoIcon width="14px" color="textSubtle" />
                        {tooltipVisible && tooltip}
                      </FlexGap>
                    </FlexGap>
                  )}
                </FlexGap>
              </FlexGap>
            </>
          )}
        </FlexGap>
      </CardBody>
    </Card>
  )
}
