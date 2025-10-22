import { useTranslation } from '@pancakeswap/localization'
import { Button, Link, Modal, OpenNewIcon, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'

interface NotEnoughTokensModalProps {
  tokenSymbol: string
  tokenAddress?: string
  onDismiss?: () => void
}

const StyledLink = styled(Link)`
  width: 100%;
`

const NotEnoughTokensModal: React.FC<React.PropsWithChildren<NotEnoughTokensModalProps>> = ({
  tokenSymbol,
  tokenAddress,
  onDismiss,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <Modal
      title={t('%symbol% required', { symbol: tokenSymbol })}
      onDismiss={onDismiss}
      headerBackground={theme.colors.gradientCardHeader}
    >
      <Text color="failure" bold>
        {t('Insufficient %symbol% balance', { symbol: tokenSymbol })}
      </Text>
      <Text mt="24px">{t('You’ll need %symbol% to stake in this pool!', { symbol: tokenSymbol })}</Text>
      <Text>
        {t('Buy some %symbol%, or make sure your %symbol% isn’t in another pool or LP.', {
          symbol: tokenSymbol,
        })}
      </Text>
      <Button mt="24px" as="a" external href={tokenAddress ? `/swap?outputCurrency=${tokenAddress}` : '/swap'}>
        {t('Buy')} {tokenSymbol}
      </Button>
      <StyledLink href="https://yieldwatch.net" external>
        <Button variant="secondary" mt="8px" width="100%">
          {t('Locate Assets')}
          <OpenNewIcon color="primary" ml="4px" />
        </Button>
      </StyledLink>
      <Button variant="text" onClick={onDismiss}>
        {t('Close Window')}
      </Button>
    </Modal>
  )
}

export default NotEnoughTokensModal
