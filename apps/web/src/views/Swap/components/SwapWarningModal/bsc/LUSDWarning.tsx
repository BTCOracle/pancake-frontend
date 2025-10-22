import { Box, Link, Text } from '@pancakeswap/uikit'
import { useTranslation, Trans } from '@pancakeswap/localization'

const LUSDWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>{t('Caution - lUSD Token')}</Text>
      <Text>
        <Trans
          i18nKey="Please exercise due caution when trading or providing liquidity for the lUSD token. The protocol was recently affected by an <0>exploit.</0> For more information, please refer to Linear Finance’s <1>Twitter</1>"
          components={[
            <Link
              external
              style={{ display: 'inline' }}
              href="https://twitter.com/LinearFinance/status/1704818417880936535"
            />,
            <Link external ml="4px" style={{ display: 'inline' }} href="https://twitter.com/LinearFinance" />,
          ]}
        />
      </Text>
    </Box>
  )
}

export default LUSDWarning
