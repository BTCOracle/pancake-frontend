import { Box, Link, Text } from '@pancakeswap/uikit'
import { useTranslation, Trans } from '@pancakeswap/localization'
import { useMemo } from 'react'
import { Token } from '@pancakeswap/sdk'

interface GenericTokenWarningProps {
  token: Token
  statusHref: string
  profileHref: string
}

const GenericTokenWarning: React.FC<GenericTokenWarningProps> = ({ token, statusHref, profileHref }) => {
  const { t } = useTranslation()

  const components = useMemo(
    () => [
      <Link external m="0 4px" style={{ display: 'inline' }} href={statusHref} />,
      <Link external ml="4px" style={{ display: 'inline' }} href={profileHref} />,
    ],
    [statusHref, profileHref],
  )

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - %symbol% Token', { symbol: token.symbol })}</Text>
      <Text>
        <Trans
          i18nTemplate="Please exercise due caution when trading / providing liquidity for the %symbol% token. The protocol recently encountered a <0>security compromise.</0> For more information, please refer to <1>%name% X</1>"
          values={{ symbol: token.symbol, name: token.name }}
          components={components}
        />
      </Text>
    </Box>
  )
}

export default GenericTokenWarning
