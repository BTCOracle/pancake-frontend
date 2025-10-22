import { useTranslation } from '@pancakeswap/localization'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'

export const useIFODuration = (duration: number) => {
  const { days, hours, minutes } = getTimePeriods(duration)
  const { t } = useTranslation()

  if (days > 0) {
    const dayText = days === 1 ? t('1 day') : `${days} ${t('days')}`
    if (hours > 0) {
      const hourText = `${hours} ${t(hours > 1 ? 'hours' : 'hour')}`
      return `${dayText} ${hourText}`
    }
    if (minutes > 0) {
      return `${dayText} ${minutes} ${t('mins')}`
    }
    return dayText
  }

  if (hours > 0) {
    const hourText = hours === 1 ? t('1 hour') : `${hours} ${t('hours')}`
    if (minutes > 0) {
      return `${hourText} ${minutes} ${t('mins')}`
    }
    return hourText
  }

  if (minutes > 0) {
    return `${minutes} ${t('mins')}`
  }

  return `${t('< 1 min')}`
}
