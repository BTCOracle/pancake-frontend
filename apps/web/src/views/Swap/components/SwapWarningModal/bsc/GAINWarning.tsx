import { Box, Link, Text } from '@pancakeswap/uikit'
import { useTranslation, Trans } from '@pancakeswap/localization'

const GAINWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - GAIN Token')}</Text>
      <Text>
        <Trans
          i18nKey="Please exercise due caution when trading / providing liquidity for the GAIN token. The protocol recently encountered a <0>security compromise.</0> For more information, please refer to <1>GriffinAI X</1>"
          components={[
            <Link
              external
              m="0 4px"
              style={{ display: 'inline' }}
              href="https://x.com/Griffin_AI/status/1971049192245047677"
            />,
            <Link external ml="4px" style={{ display: 'inline' }} href="https://x.com/Griffin_AI" />,
          ]}
        />
      </Text>
    </Box>
  )
}

export default GAINWarning
