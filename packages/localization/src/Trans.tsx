import { ComponentProps } from 'react'
import { Trans as I18nNextTrans } from 'react-i18next'

type TransProps_ = ComponentProps<typeof I18nNextTrans>
export type TransProps = Omit<TransProps_, 'defaults'> & {
  i18nTemplate?: string
  style?: React.CSSProperties
}

export const Trans = (props: TransProps) => {
  const { i18nTemplate, style, ...rest } = props
  return <I18nNextTrans {...rest} defaults={i18nTemplate} style={style} />
}
