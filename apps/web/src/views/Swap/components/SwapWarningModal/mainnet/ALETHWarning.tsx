import { Link, Text, Box } from '@pancakeswap/uikit'
import { useTranslation, Trans } from '@pancakeswap/localization'

const ALETHWarning = () => {
  const { t } = useTranslation()

  return (
    <Box maxWidth="380px">
      <Trans
        i18nKey="Please exercise due caution when trading / providing liquidity for the alETH token. The protocol was recently affected by the <0>Curve exploit.</0> For more information, please refer to Alchemix’s <1>Twitter</1> and await further updates from the team"
        components={[
          <Link
            external
            m="0 4px"
            style={{ display: 'inline' }}
            href="https://twitter.com/CurveFinance/status/1685925429041917952"
          />,
          <Link
            external
            m="0 4px"
            style={{ display: 'inline' }}
            href="https://twitter.com/AlchemixFi/status/1685737632133971968"
          />,
        ]}
      />
    </Box>
  )
}

export default ALETHWarning
