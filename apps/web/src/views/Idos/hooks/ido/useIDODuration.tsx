import { useTranslation } from '@pancakeswap/localization'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'

export const useIDODuration = (duration: number) => {
  const { days, hours, minutes } = getTimePeriods(duration, 'ceil')
  const { t } = useTranslation()

  if (days > 1) {
    return `${days} ${t('days')}`
  }

  if (hours >= 2) {
    return `${hours} ${t('hours')}`
  }

  if (hours === 1) {
    return `${t('1 hour')} ${minutes} ${t('mins')}`
  }

  if (minutes > 1) {
    return `${minutes} ${t('mins')}`
  }

  return `${t('< 1 min')}`
}
