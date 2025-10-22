import { useTranslation } from '@pancakeswap/localization'
import * as yup from 'yup'

const numberTransform = yup.number().transform((value) => (Number.isNaN(value) ? 0 : value))
const numberSchema = (errMsg: string) => numberTransform.moreThan(0, errMsg).required(errMsg)

export default function useMarketSchema() {
  const { t } = useTranslation()
  return yup.object().shape({
    baseToken: yup.mixed().required(t('Select base token') ?? ''),
    quoteToken: yup.mixed().required(t('Select quote token') ?? ''),
    orderSize: numberSchema(t('Enter order size') ?? ''),
    priceTick: numberSchema(t('Enter price tick') ?? '')
  })
}
