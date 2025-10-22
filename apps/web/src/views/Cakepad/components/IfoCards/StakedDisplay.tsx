import { useTranslation } from '@pancakeswap/localization'
import { AddIcon, Button, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo, NumberDisplay } from '@pancakeswap/widgets-internal'
import { useStablecoinPriceAmount } from 'hooks/useStablecoinPrice'
import { useState } from 'react'
import useIfo from '../../hooks/useIfo'
import { IfoDepositForm, formatDollarAmount } from './IfoDepositForm'

export const StakedDisplay: React.FC<{ pid: number }> = ({ pid }) => {
  const { t } = useTranslation()
  const { users } = useIfo()
  const userStatus = users[pid]
  const stakedAmount = userStatus?.stakedAmount
  const stakeCurrency = userStatus?.stakedAmount?.currency
  const [adding, setAdding] = useState(false)

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
    <FlexGap flexDirection="column" gap="8px">
      <FlexGap gap="8px" justifyContent="space-between" alignItems="center">
        <FlexGap flexDirection="column">
          <FlexGap gap="8px" alignItems="center">
            {stakeCurrency && <CurrencyLogo size="24px" currency={stakeCurrency} />}
            <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
              {stakeCurrency?.symbol} {t('Pool')} {t('Deposited')}
            </Text>
          </FlexGap>
          <FlexGap gap="8px" flexDirection="column">
            <NumberDisplay
              value={stakedAmount?.toExact()}
              suffix={` ${stakeCurrency?.symbol ?? ''}`}
              fontSize="20px"
              lineHeight="30px"
              bold
            />
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
        {!adding && (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            <AddIcon color="primary" />
          </Button>
        )}
      </FlexGap>
      {adding && <IfoDepositForm pid={pid} onDismiss={() => setAdding(false)} />}
    </FlexGap>
  )
}
