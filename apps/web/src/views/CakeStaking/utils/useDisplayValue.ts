import { useTranslation } from '@pancakeswap/localization'
import { getBalanceAmount } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import formatLocaleNumber from 'utils/formatLocaleNumber'

export function useDisplayValue(val: number | bigint | BigNumber | undefined) {
  const {
    currentLanguage: { locale },
  } = useTranslation()
  return getDisplayValue(val, locale)
}

export function getDisplayValue(val: number | bigint | BigNumber | undefined, locale: string) {
  if (!val) {
    return '-'
  }
  const bnVal = typeof val === 'bigint' || typeof val === 'number' ? BigNumber(val.toString()) : val
  if (bnVal.isZero()) {
    return '-'
  }
  const val1 = getBalanceAmount(bnVal, 18).toNumber()
  if (val1 < 0.01) {
    return formatLocaleNumber({
      number: val1,
      locale,
      sigFigs: 4,
    })
  }
  return formatLocaleNumber({
    number: val1,
    locale,
    fixedDecimals: 2,
  })
}
