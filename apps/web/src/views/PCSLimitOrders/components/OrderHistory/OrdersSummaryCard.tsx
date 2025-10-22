import { FlexGap, Text, ArrowForwardIcon, WaitIcon, useModalV2 } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { LightCard } from '@pancakeswap/widgets-internal'
import { useUserOpenLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS } from 'config/constants/supportChains'
import { OrdersModal } from './OrdersModal'

const StyledCard = styled(LightCard)`
  padding: 16px;
  border-radius: 24px;
  width: 100%;

  cursor: pointer;

  &:focus {
    outline: 4px solid ${({ theme }) => theme.colors.secondary};
  }
`

export const OrdersSummaryCard = () => {
  const { t } = useTranslation()
  const { isOpen, onOpen, onDismiss } = useModalV2()
  const { chainId } = useAccountActiveChain()

  const {
    data: { openOrders, totalOrders },
    isLoading,
  } = useUserOpenLimitOrders()

  const isWrongNetwork = !LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId)

  if (isWrongNetwork || (!totalOrders.length && !isLoading)) return null

  return (
    <>
      <StyledCard as="button" onClick={onOpen}>
        <FlexGap justifyContent="space-between" alignItems="center">
          <FlexGap gap="8px">
            <WaitIcon color="textSubtle" />
            <Text color="textSubtle" small bold>
              {t('%number% Open Limit Orders', { number: openOrders.length || 0 })}
            </Text>
          </FlexGap>

          <ArrowForwardIcon mt="1px" color="textSubtle" width="24px" height="24px" />
        </FlexGap>
      </StyledCard>
      <OrdersModal isOpen={isOpen} onDismiss={onDismiss} />
    </>
  )
}
