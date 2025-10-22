import { useTranslation } from '@pancakeswap/localization'
import { AtomBoxProps, Grid, useMatchBreakpoints } from '@pancakeswap/uikit'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useSolanaV3RewardInfoFromSimulation } from 'views/universalFarms/hooks/useSolanaV3RewardInfoFromSimulation'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { DetailInfoLabel } from './styled'
import { EarningsWithToken } from './EarningsWithToken'

export const SolanaV3Earnings = ({
  pool,
  position,
  rowProps,
}: {
  pool: SolanaV3PoolInfo
  position: SolanaV3PositionDetail
  rowProps?: AtomBoxProps
}) => {
  const { t } = useTranslation()
  const { breakdownRewardInfo } = useSolanaV3RewardInfoFromSimulation({
    poolInfo: pool,
    position,
  })
  const { isMobile } = useMatchBreakpoints()
  const maxColumn = Math.max(breakdownRewardInfo.rewards.length, 2)

  const haveFarmRewards =
    breakdownRewardInfo.rewards.length > 0 && breakdownRewardInfo.rewards.some((r) => Number(r.amount) > 0)
  const haveLpFees = Number(breakdownRewardInfo.fee.A?.amount) > 0 || Number(breakdownRewardInfo.fee.B?.amount) > 0

  if (!haveFarmRewards && !haveLpFees) return null

  return (
    <>
      {haveFarmRewards && (
        <Grid gridGap="8px" alignItems="flex-start" gridTemplateColumns={isMobile ? '1fr' : '80px 1fr'}>
          <DetailInfoLabel>{t('Farm Rewards')}:</DetailInfoLabel>
          <Grid gridTemplateColumns={isMobile ? '1fr 1fr' : `repeat(${maxColumn}, minmax(120px, 1fr))`} gridGap="8px">
            {breakdownRewardInfo.rewards
              .filter((r) => Number(r.amount) > 0)
              .map((r, index) => (
                <EarningsWithToken
                  key={index}
                  currency={convertRawTokenInfoIntoSPLToken(r.mint as TokenInfo)}
                  earningsAmount={Number(r.amount)}
                  earningsUsd={Number(r.amountUSD)}
                  rowProps={{ justifyContent: isMobile ? 'space-between' : 'flex-end' }}
                />
              ))}
          </Grid>
        </Grid>
      )}
      {haveLpFees && (
        <Grid gridGap="8px" alignItems="flex-start" gridTemplateColumns={isMobile ? '1fr' : '90px 1fr'}>
          <DetailInfoLabel>{t('LP Fees')}: </DetailInfoLabel>
          <Grid gridTemplateColumns={isMobile ? '1fr 1fr' : `repeat(${maxColumn}, minmax(120px, 1fr))`} gridGap="8px">
            {breakdownRewardInfo.fee.A?.mint && Number(breakdownRewardInfo.fee.A?.amount) > 0 ? (
              <EarningsWithToken
                currency={convertRawTokenInfoIntoSPLToken(breakdownRewardInfo.fee.A?.mint as TokenInfo)}
                earningsAmount={Number(breakdownRewardInfo.fee.A?.amount)}
                earningsUsd={Number(breakdownRewardInfo.fee.A?.amountUSD)}
                rowProps={{ justifyContent: isMobile ? 'space-between' : 'flex-end' }}
              />
            ) : null}
            {breakdownRewardInfo.fee.B?.mint && Number(breakdownRewardInfo.fee.B?.amount) > 0 ? (
              <EarningsWithToken
                currency={convertRawTokenInfoIntoSPLToken(breakdownRewardInfo.fee.B?.mint as TokenInfo)}
                earningsAmount={Number(breakdownRewardInfo.fee.B?.amount)}
                earningsUsd={Number(breakdownRewardInfo.fee.B?.amountUSD)}
                rowProps={{ justifyContent: isMobile ? 'space-between' : 'flex-end' }}
              />
            ) : null}
          </Grid>
        </Grid>
      )}
    </>
  )
}
