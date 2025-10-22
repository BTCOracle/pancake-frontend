import { useTranslation } from '@pancakeswap/localization'
import { Message, MessageText, Text } from '@pancakeswap/uikit'
import { DISABLED_ADD_LIQUIDITY_CHAINS } from 'config/constants/liquidity'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { chains } from 'utils/wagmi'

dayjs.extend(advancedFormat)

type LiquiditySunsetWarningProps = {
  overrideChainId?: number
}

const LiquiditySunsetWarning = ({ overrideChainId }: LiquiditySunsetWarningProps) => {
  const { t } = useTranslation()
  const { chainId: activeChainId } = useActiveChainId()

  const chainId = overrideChainId ?? activeChainId

  const chainName = useMemo(() => {
    return chains.find((c) => c.id === chainId)?.name
  }, [chainId])

  const sunsetInfo = DISABLED_ADD_LIQUIDITY_CHAINS[chainId]

  if (!sunsetInfo) {
    return null
  }

  return (
    <Message variant="warning" style={{ width: '100%' }}>
      <MessageText>
        <Text mb="8px" bold>
          {t('Important Notice: %chain% Sunset', { chain: chainName })}
        </Text>
        {t(
          '%chain% will be sunset on %date%. Please make sure to remove your liquidity from all pools before deadline.',
          { chain: chainName, date: dayjs.unix(sunsetInfo.sunsetDate).format('D MMMM') },
        )}
      </MessageText>
    </Message>
  )
}

export default LiquiditySunsetWarning
