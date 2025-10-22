import { useState, useEffect } from 'react'
import { ApiClmmConfigInfo, TokenInfo } from '@pancakeswap/solana-core-sdk'
import * as yup from 'yup'
import { useTranslation, type TranslateFunction } from '@pancakeswap/localization'

interface Props {
  config?: ApiClmmConfigInfo
  currentPrice: string
  priceRange: string[]
  tokenAmount: string[]
  tokens: {
    token1?: TokenInfo
    token2?: TokenInfo
  }
}

const numberTransform = yup.number().transform((value) => (Number.isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg)

const schema = (t: TranslateFunction) =>
  yup.object().shape({
    tokenAmount: yup
      .array()
      .of(numberTransform)
      .test('is-tokenAmount-valid', t('Enter token amount') ?? '', (value: any) => {
        if ((value as number[]).some((val) => val > 0)) return true
        return false
      }),
    upperPrice: numberSchema(t('Enter upper price')),
    lowerPrice: numberSchema(t('Enter lower price')),
    currentPrice: numberSchema(t('Enter current price')),
    config: yup.mixed().required(t('Select pool fee tier') ?? ''),
    token2: yup.mixed().required(t('Select pool token 2') ?? ''),
    token1: yup.mixed().required(t('Select pool token 1') ?? '')
  })

export default function useValidate(props: Props) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()
  useEffect(() => {
    try {
      const { priceRange, tokens, tokenAmount } = props
      schema(t).validateSync({
        ...props,
        ...tokens,
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

const priceRangeSchema = (t: TranslateFunction) =>
  yup.object().shape({
    minPrice: numberSchema(t('Enter min price')).test('is-minPrice-valid', t('Invalid min price') as string, function (value?: number) {
      if (this.parent.focusMintA && (value ?? 0) > this.parent.maxPrice) return false
      return true
    }),
    maxPrice: numberSchema(t('Enter max price')).test('is-maxPrice-valid', t('Invalid max price') as string, function (value?: number) {
      if (!this.parent.focusMintA && (value ?? 0) < this.parent.minPrice) return false
      return true
    }),
    currentPrice: numberSchema(t('Enter current price'))
  })

export function usePriceRangeValidate(props: { currentPrice: string; priceRange: string[]; focusMintA: boolean }) {
  const [error, setError] = useState<string | undefined>()
  const { t } = useTranslation()

  useEffect(() => {
    try {
      const { priceRange } = props
      priceRangeSchema(t).validateSync({
        ...props,
        minPrice: priceRange[0],
        maxPrice: priceRange[1]
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message as string)
    }
  }, [props])

  return error
}
