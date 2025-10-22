import { useTranslation, Trans } from '@pancakeswap/localization'
import { Box, Text, Link } from '@pancakeswap/uikit'

const CcarWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Text>
        <Trans
          i18nKey="Crypto Cars (CCAR) has been migrated to <0>a new contract address.</0> Trading on the old address may result in the complete loss of your assets. For more information please refer to <1>the announcement.</1>"
          components={[
            <Link
              style={{ display: 'inline' }}
              external
              href="https://bscscan.com/token/0x322e5015Cc464Ada7f99dE7131CE494dE1834396"
            />,
            <Link style={{ display: 'inline' }} external href="https://t.me/Crypto_Cars_Official/465037" />,
          ]}
        />
      </Text>
    </Box>
  )
}

export default CcarWarning
