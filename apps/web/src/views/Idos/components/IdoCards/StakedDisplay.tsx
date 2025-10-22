import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import type { IDOUserStatus } from 'views/Idos/hooks/ido/useIDOUserStatus'
import { IdoDepositButton, formatDollarAmount } from './IdoDepositButton'

export const StakedDisplay: React.FC<{ userStatus: IDOUserStatus; pid: number }> = ({ userStatus, pid }) => {
  const { t } = useTranslation()
  const stakedAmount = userStatus?.stakedAmount
  const stakeCurrency = userStatus?.stakedAmount?.currency

  const amountInDollar = useStablecoinPriceAmount(
    stakeCurrency ?? undefined,
    stakedAmount !== undefined && Number.isFinite(+stakedAmount.toSignificant(6))
      ? +stakedAmount.toSignificant(6)
      : undefined,
    {
      enabled: Boolean(stakedAmount !== undefined && Number.isFinite(+stakedAmount.toSignificant(6))),
    },
  )
  return (
    <FlexGap gap="8px" justifyContent="space-between" alignItems="center">
      <FlexGap flexDirection="column">
        <FlexGap gap="8px" alignItems="center">
          {stakeCurrency && <CurrencyLogo size="24px" currency={stakeCurrency} />}
          <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
            {stakeCurrency?.symbol} {t('Pool')} {t('Deposited')}
          </Text>
        </FlexGap>
        <FlexGap gap="8px" flexDirection="column">
          <Text fontSize="20px" bold lineHeight="30px">
            {stakedAmount?.toSignificant(6)}
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
      <IdoDepositButton userStatus={userStatus} type="add" pid={pid} />
    </FlexGap>
  )
}
