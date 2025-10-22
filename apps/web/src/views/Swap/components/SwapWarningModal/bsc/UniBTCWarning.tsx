import { useTranslation, Trans } from '@pancakeswap/localization'
import { Box, Link, Text } from '@pancakeswap/uikit'

const LUSDWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - %token% Token', { token: 'uniBTC' })}</Text>
      <Text>
        <Trans
          i18nKey="Please exercise due caution when trading / providing liquidity for the uniBTC token. The protocol recently encountered a security compromise. For more information, please refer to %org%’s <0>Twitter</0>"
          values={{ org: 'BedRock' }}
          components={[<Link external ml="4px" style={{ display: 'inline' }} href="https://x.com/Bedrock_DeFi" />]}
        />
      </Text>
    </Box>
  )
}

export default LUSDWarning
