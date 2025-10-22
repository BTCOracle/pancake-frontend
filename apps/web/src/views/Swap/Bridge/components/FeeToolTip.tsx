import { useTranslation } from '@pancakeswap/localization'
import { Link, Text } from '@pancakeswap/uikit'

export function TotalFeeToolTip() {
  const { t } = useTranslation()

  return (
    <>
      <Text mb="12px">
        <Text bold display="inline-block">
          {t('AMM')}
        </Text>
        : {t('Trading fee varies by pool fee tier. Check it via the magnifier icon under "Route."')}
      </Text>
      <Text mt="12px">
        <Link
          style={{ display: 'inline' }}
          ml="4px"
          external
          href="https://docs.pancakeswap.finance/products/pancakeswap-exchange/faq#what-will-be-the-trading-fee-breakdown-for-v3-exchange"
        >
          {t('Fee Breakdown and Tokenomics')}
        </Link>
      </Text>
      <Text mt="10px">
        <Text bold display="inline-block">
          {t('X')}
        </Text>
        : {t('No fee when trading through PancakeSwap X (subject to change).')}
      </Text>
    </>
  )
}

export function BridgeFeeToolTip() {
  const { t } = useTranslation()

  return <Text>{t('Paid to relayers for bridging the assets.')}</Text>
}

export function TradingFeeToolTip() {
  const { t } = useTranslation()

  return (
    <Text>
      {t(
        'Applied on both source and destination chain swaps based on pool fee tiers. Check routing details for more info.',
      )}
    </Text>
  )
}
