import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'
import { useTranslation, type TranslateFunction } from '@pancakeswap/localization'
import * as yup from 'yup'

interface Props {
  poolId?: string
  priceRange: string[]
  tokenAmount: string[]
  balanceA?: string | number
  balanceB?: string | number
}

const numberTransform = yup.number().transform((value) => (Number.isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg)

const schema = (t: TranslateFunction) =>
  yup.object().shape({
    balanceB: yup
      .number()
      .transform((value) => (Number.isNaN(value) ? 0 : value))
      .test('is-balanceB-enough', t('Insufficient balance') ?? '', function (val) {
        return new Decimal(val || 0).gte(this.parent.tokenAmount[1])
      }),
    balanceA: yup
      .number()
      .transform((value) => (Number.isNaN(value) ? 0 : value))
      .test('is-balanceA-enough', t('Insufficient balance') ?? '', function (val) {
        return new Decimal(val || 0).gte(this.parent.tokenAmount[0])
      }),
    tokenAmount: yup
      .array()
      .of(numberTransform)
      .test('is-tokenAmount-valid', t('Enter Token Amount') ?? '', (value: any) => {
        if ((value as number[]).some((val) => val > 0)) return true
        return false
      }),
    upperPrice: numberSchema(t('Enter Upper Price')).test('is-priceMin-valid', t('Invalid max price') ?? '', function (value?: number) {
      if (value && value < this.parent.lowerPrice) return false
      return true
    }),
    lowerPrice: numberSchema(t('Enter Lower Price')).test('is-priceMax-valid', t('Invalid min price') ?? '', function (value?: number) {
      if (value && value > this.parent.upperPrice) return false
      return true
    }),
    poolId: yup.string().required(t('Pool not found') ?? '')
  })

export default function useValidate(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      const { priceRange, tokenAmount } = props
      schema(t).validateSync({
        ...props,
        tokenAmount,
        lowerPrice: priceRange[0],
        upperPrice: priceRange[1]
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}
