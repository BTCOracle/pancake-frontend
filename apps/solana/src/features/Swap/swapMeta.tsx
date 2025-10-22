import { type TranslateFunction } from '@pancakeswap/localization'

export const getTxMeta = ({ values = {}, t }: { values?: Record<string, unknown>; t: TranslateFunction }) => {
  // Filter values to only allow string, number, or undefined
  const filteredValues = Object.fromEntries(
    Object.entries(values).filter(([, v]) => typeof v === 'string' || typeof v === 'number' || typeof v === 'undefined')
  ) as Record<string, string | number | undefined>

  return {
    title: t('Swap'),
    description: t('Swap %amountA% %symbolA% for %amountB% %symbolB%.', { ...filteredValues }),
    txHistoryTitle: t('Swap'),
    txHistoryDesc: t('Swap %amountA% %symbolA% for %amountB% %symbolB%.', { ...filteredValues }),
    txValues: values
  }
}
