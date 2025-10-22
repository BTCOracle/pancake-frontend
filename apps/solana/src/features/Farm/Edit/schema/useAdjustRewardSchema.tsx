import { useState, useEffect } from 'react'
import * as yup from 'yup'
import Decimal from 'decimal.js'
import { Trans, useTranslation, type TranslateFunction } from '@pancakeswap/localization'
import { MAX_DURATION_DAYS, MIN_DURATION_DAYS } from '@/store/configs/farm'
import { EditReward } from '../util'

interface Props {
  remainSeconds: Decimal
  isDecrease: boolean
  onlineCurrentDate: number
  oldReward: EditReward
  daysExtend?: string | number
  balance: string | number
  amount?: string | number
}

export const ADJUST_REWARD_ERROR = {
  BALANCE_INSUFFICIENT: <Trans>Insufficient sub balance</Trans>,
  DECREASE: <Trans>Decrease Reward Rate</Trans>,
  DECREASE_72h: <Trans>Decrease reward within 72 hours</Trans>,
  DAYS_EXTEND: <Trans>Add reward days</Trans>
}

const numberTransform = yup.number().transform((value) => (Number.isNaN(value) ? 0 : value))
const schema = (t: TranslateFunction) =>
  yup
    .object()
    .shape({
      amount: yup
        .number()
        .min(0, t('Enter token amount') ?? '')
        .transform((value) => (Number.isNaN(value) ? 0 : value)),
      daysExtend: numberTransform.min(0, t('Enter days to extend') ?? '').transform((value) => (Number.isNaN(value) ? 0 : value))
    })
    .test('both-not-zero', t('Amount and days cannot both be zero') ?? '', function (ctx) {
      const amount = ctx.amount || 0
      const daysExtend = ctx.daysExtend || 0
      if (amount === 0 && daysExtend === 0) {
        return this.createError({
          message: t('Amount and days cannot both be zero')
        })
      }
      return true
    })

export default function useAdjustRewardSchema(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      schema(t).validateSync(props)
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props, t])

  return error
}
