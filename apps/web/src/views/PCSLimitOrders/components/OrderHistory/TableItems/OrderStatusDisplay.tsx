import { useTranslation } from '@pancakeswap/localization'
import { BoxProps } from '@pancakeswap/uikit'
import { TagV2 } from 'components/Liquidity/Badges'
import { OrderStatus } from 'views/PCSLimitOrders/types/orders.types'

interface OrderStatusDisplayProps extends BoxProps {
  status: OrderStatus
}
export const OrderStatusDisplay = ({ status, ...props }: OrderStatusDisplayProps) => {
  const { t } = useTranslation()

  const getText = () => {
    switch (status) {
      case OrderStatus.Open:
        return t('Pending')
      case OrderStatus.Cancelled:
        return t('Cancelled')

      // show "Filled" for withdrawn too
      case OrderStatus.Withdrawn:
      case OrderStatus.Filled:
        return t('Filled')

      case OrderStatus.PartiallyFilled:
        return t('Partially Filled')
      default:
        return status
    }
  }

  const getVariant = () => {
    switch (status) {
      case OrderStatus.Open:
        return 'warning'
      case OrderStatus.Cancelled:
        return 'danger'
      case OrderStatus.Withdrawn:
      case OrderStatus.Filled:
        return 'success'
      case OrderStatus.PartiallyFilled:
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <TagV2 {...props} variant={getVariant()}>
      {getText()}
    </TagV2>
  )
}
