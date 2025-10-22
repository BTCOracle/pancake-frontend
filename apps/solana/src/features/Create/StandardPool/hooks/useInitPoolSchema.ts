import Decimal from 'decimal.js'
import { useEffect, useState } from 'react'
import { useTranslation, type TranslateFunction } from '@pancakeswap/localization'
import * as yup from 'yup'
import { ApiCpmmConfigInfo, ApiV3Token } from '@pancakeswap/solana-core-sdk'
import BN from 'bn.js'
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token-0.4'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'
import { wSolToSol } from '@/utils/token'

const numberTransform = yup.number().transform((value) => (Number.isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg).required(errMsg)

interface Props {
  startTime?: Date
  tokenAmount?: { base: string; quote: string }
  quoteToken?: ApiV3Token
  baseToken?: ApiV3Token
  feeConfig?: ApiCpmmConfigInfo
  isAmmV4?: boolean
}

// new BN(baseAmount).mul(new BN(quoteAmount)).gt(new BN(1).mul(new BN(10 ** baseToken.decimals)).pow(new BN(2)))

export default function useInitPoolSchema({ startTime, baseToken, quoteToken, tokenAmount, feeConfig, isAmmV4 }: Props) {
  const { t } = useTranslation()

  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const [error, setError] = useState<string | undefined>()

  const baseBalance = getTokenBalanceUiAmount({ mint: wSolToSol(baseToken?.address) || '', decimals: baseToken?.decimals }).text
  const quoteBalance = getTokenBalanceUiAmount({ mint: wSolToSol(quoteToken?.address) || '', decimals: quoteToken?.decimals }).text

  const schema = (t: TranslateFunction) =>
    yup.object().shape({
      ...(isAmmV4 ? {} : { feeConfig: yup.mixed().required(t('Select') + t('fee tier')) }),
      ...(isAmmV4
        ? {
            liquidity: yup
              .mixed()
              .test(
                'is-liquidity-valid',
                t('Initial liquidity is too low, try increasing the amount.') ?? 'initial liquidity too low',
                function () {
                  if (this.parent.baseToken && this.parent.quoteToken && this.parent.baseAmount && this.parent.quoteAmount) {
                    return new BN(new Decimal(this.parent.baseAmount).mul(10 ** this.parent.baseToken.decimals).toFixed(0))
                      .mul(new BN(new Decimal(this.parent.quoteAmount).mul(10 ** this.parent.quoteToken.decimals).toFixed(0)))
                      .gt(new BN(1).mul(new BN(10 ** this.parent.baseToken.decimals)).pow(new BN(2)))
                  }
                  return true
                }
              )
          }
        : {}),
      startTime: yup.mixed().test('is-date-valid', t('Start time cannot be set to a time in the past.') ?? '', function (val: Date) {
        return !val || val.valueOf() > Date.now()
      }),
      quoteBalance: yup
        .string()
        .test('is-balance-enough', t('%side% token balance is insufficient', { side: 'quote' }) ?? '', function (val?: string) {
          return new Decimal(val || 0).gte(this.parent.quoteAmount)
        }),
      baseBalance: yup
        .string()
        .test('is-balance-enough', t('%side% token balance is insufficient', { side: 'base' }) ?? '', function (val?: string) {
          return new Decimal(val || 0).gte(this.parent.baseAmount)
        }),
      quoteAmount: numberSchema(t('Input an amount of %side% greater than zero', { side: 'quote' })),
      baseAmount: numberSchema(t('Input an amount of %side% greater than zero', { side: 'base' })),
      quote: yup
        .mixed()
        .test(
          'is-mint-prgoram-valid',
          `${t('Amm V4 pool does not support token 2022') || 'Amm V4 pool does not support token 2022'} (Quote Mint)`,
          function () {
            if (!isAmmV4) return true
            if (this.parent.quoteToken && this.parent.quoteToken.programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
              return false
            }
            return true
          }
        ),
      quoteToken: yup.mixed().required(t('Select %side% token', { side: 'quote' }) ?? ''),
      base: yup
        .mixed()
        .test(
          'is-mint-prgoram-valid',
          `${t('Amm V4 pool does not support token 2022') || 'Amm V4 pool does not support token 2022'} (Base mint)`,
          function () {
            if (!isAmmV4) return true
            if (this.parent.baseToken && this.parent.baseToken.programId === TOKEN_2022_PROGRAM_ID.toBase58()) {
              return false
            }
            return true
          }
        ),
      baseToken: yup.mixed().required(t('Select %side% token', { side: 'base' }) ?? '')
    })

  useEffect(() => {
    try {
      schema(t).validateSync({
        baseToken,
        quoteToken,
        baseAmount: tokenAmount?.base,
        quoteAmount: tokenAmount?.quote,
        startTime,
        baseBalance,
        quoteBalance,
        feeConfig
      })
      setError(undefined)
    } catch (e: any) {
      setError(e.message)
    }
  }, [baseToken, quoteToken, tokenAmount, startTime, baseBalance, quoteBalance, feeConfig])

  return error
}
