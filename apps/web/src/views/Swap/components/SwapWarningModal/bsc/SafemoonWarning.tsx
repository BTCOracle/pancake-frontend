import { useTranslation, Trans } from '@pancakeswap/localization'
import { Box, Text, Link } from '@pancakeswap/uikit'

const SafemoonWarning = () => {
  const { t } = useTranslation()

  // Break translation sentences into pieces because the current translation approach doesn't support Link interpolation.
  return (
    <Box maxWidth="380px">
      <Text>
        <Trans
          i18nKey="SAFEMOON has been migrated to <0>a new contract address.</0> Trading on the old address may result in the complete loss of your assets. For more information please refer to <1>Safemoon's announcement</1>."
          components={[
            <Link
              style={{ display: 'inline' }}
              external
              href="https://bscscan.com/address/0x42981d0bfbAf196529376EE702F2a9Eb9092fcB5"
            />,
            <Link
              style={{ display: 'inline' }}
              external
              href="https://twitter.com/safemoon/status/1477770592031887360"
            />,
          ]}
        />
      </Text>
    </Box>
  )
}

export default SafemoonWarning
