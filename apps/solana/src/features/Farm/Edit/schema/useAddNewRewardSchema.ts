import { useState, useEffect } from 'react'
import * as yup from 'yup'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { useTranslation, type TranslateFunction } from '@pancakeswap/localization'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token-0.4'

interface Props {
  onlineCurrentDate: number
  balance: string | number
  amount?: string | number
  endTime: number
  openTime: number
  mint?: ApiV3Token
  checkMint?: boolean
}

const schema = (t: TranslateFunction) =>
  yup.object().shape({
    speed: yup.mixed().test('is-amount-enough', t('Reward emissions are lower than the min required') ?? '', function () {
      const minBoundary =
        this.parent.endTime && this.parent.openTime && this.parent.mint
          ? new Decimal((this.parent.endTime - this.parent.openTime) / 1000).div(10 ** this.parent.mint.decimals)
          : undefined
      return new Decimal(this.parent.amount || 0).gte(minBoundary || 0)
    }),
    openTime: yup.number().test('is-duration-valid', t('Insufficient farm duration') ?? '', function (val) {
      return dayjs(val).isAfter(this.parent.onlineCurrentDate)
    }),
    amount: yup
      .number()
      .transform((value) => (Number.isNaN(value) ? 0 : value))
      .positive(t('Enter Token Amount') ?? '')
      .test('is-amount-valid', t('Insufficient %token% balance') ?? '', function (val) {
        return new Decimal(this.parent.balance).gte(val || '0')
      }),
    mint: yup.mixed().test('is-mint-valid', t('Select Reward Token') ?? '', function (val: ApiV3Token) {
      if (this.parent.checkMint && val && val.programId === TOKEN_2022_PROGRAM_ID.toBase58())
        return this.createError({ message: t('Farm does not support token 2022') || 'Farm does not support token 2022' })
      return this.parent.checkMint ? !!val : true
    })
  })

export default function useAddNewRewardSchema(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      schema(t).validateSync(props)
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}
