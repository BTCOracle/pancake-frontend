import {
  AutoColumn,
  Box,
  Button,
  DottedHelpText,
  FlexGap,
  IconButton,
  QuestionHelper,
  QuestionHelperV2,
  ScanLink,
  Skeleton,
  SwapHorizIcon,
  Table,
  Text,
  Toggle,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useUserLimitOrders } from 'views/PCSLimitOrders/hooks/useUserLimitOrders'
import { OrderStatus, ResponseOrder } from 'views/PCSLimitOrders/types/orders.types'
import { useOrder } from 'views/PCSLimitOrders/hooks/useOrder'
import styled from 'styled-components'
import { getBlockExploreLink } from 'utils'
import { OrderStatusDisplay } from './TableItems/OrderStatusDisplay'
import { TokenAmountDisplay } from './TableItems/TokenAmountDisplay'
import { Pagination } from './Pagination'
import { OpenOrdersToggle } from './OpenOrdersToggle'

const Thead = styled.thead`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const Th = styled.th`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 12px;
  text-transform: uppercase;
  white-space: nowrap;
  font-weight: 600 !important;
  text-align: left;
  padding: 16px;
`

const Tr = styled.tr`
  height: 74px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
`

const Td = styled.td`
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 16px;
  vertical-align: middle;
`

const MobileOrderCard = styled(Box)`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};

  &:first-of-type {
    border-top: none;
  }
`

const ScrollableContainer = styled(Box)`
  max-height: 550px;
  overflow-y: auto;
`

interface OrderTableRowProps {
  order: ResponseOrder
}
const OrderTableRow = ({ order }: OrderTableRowProps) => {
  const { t } = useTranslation()

  const {
    liveStatus,
    currencyA,
    currencyB,
    limitPrice,
    isInverted,
    originalAmountA,
    originalAmountB,
    amountBReceived,
    amountAReceived,
    filledPercentage,
    setIsInverted,
    handleCancelOrder,
    handleWithdrawOrder,
  } = useOrder(order)

  return (
    <Tr>
      <Td>{currencyA && <TokenAmountDisplay currency={currencyA} amount={originalAmountA ?? '0'} />}</Td>
      <Td>{currencyB && <TokenAmountDisplay currency={currencyB} amount={originalAmountB ?? '0'} />}</Td>
      <Td>
        <FlexGap alignItems="center" gap="4px">
          <Text small bold>
            1 {isInverted ? currencyB?.symbol : currencyA?.symbol}{' '}
          </Text>
          <IconButton onClick={() => setIsInverted(!isInverted)} variant="text" scale="xs">
            <SwapHorizIcon width="18px" height="18px" color="primary60" />
          </IconButton>{' '}
          <Text small bold>
            {limitPrice || '-'} {isInverted ? currencyA?.symbol : currencyB?.symbol}
          </Text>
        </FlexGap>
      </Td>
      <Td>
        <OrderStatusDisplay status={liveStatus} />
      </Td>
      <Td>
        <Text small bold>
          {filledPercentage || '0'}%
        </Text>
      </Td>
      <Td>
        {liveStatus === OrderStatus.Cancelled || liveStatus === OrderStatus.Open ? (
          '-'
        ) : (
          <>
            {currencyA && <TokenAmountDisplay currency={currencyA} amount={amountAReceived ?? '0'} />}
            {currencyB && <TokenAmountDisplay currency={currencyB} amount={amountBReceived ?? '0'} />}
          </>
        )}
      </Td>
      <Td>
        <FlexGap gap="8px" alignItems="center">
          <ScanLink color="primary60" size="24px" href={getBlockExploreLink(order.transaction_hash, 'transaction')} />
          {(liveStatus === OrderStatus.Open || liveStatus === OrderStatus.PartiallyFilled) && (
            <Button variant="dangerOutline" onClick={handleCancelOrder}>
              {t('Cancel')}
            </Button>
          )}
          {liveStatus === OrderStatus.Filled && (
            <Button variant="primary60Outline" onClick={handleWithdrawOrder}>
              {t('Withdraw')}
            </Button>
          )}
        </FlexGap>
      </Td>
    </Tr>
  )
}

interface MobileOrderProps {
  order: ResponseOrder
}
const MobileOrder = ({ order }: MobileOrderProps) => {
  const { t } = useTranslation()

  const {
    liveStatus,
    currencyA,
    currencyB,
    limitPrice,
    isInverted,
    originalAmountA,
    originalAmountB,
    amountBReceived,
    amountAReceived,
    filledPercentage,
    setIsInverted,
    handleCancelOrder,
    handleWithdrawOrder,
  } = useOrder(order)

  return (
    <MobileOrderCard>
      <AutoColumn gap="8px">
        <FlexGap alignItems="center" justifyContent="space-between">
          <OrderStatusDisplay status={liveStatus} />
          <ScanLink color="primary60" size="24px" href={getBlockExploreLink(order.transaction_hash, 'transaction')} />
        </FlexGap>
        <FlexGap alignItems="center" justifyContent="space-between">
          <Text color="textSubtle">{t('Sell')}</Text>
          {currencyA && <TokenAmountDisplay currency={currencyA} amount={originalAmountA ?? '0'} />}
        </FlexGap>
        <FlexGap alignItems="center" justifyContent="space-between">
          <Text color="textSubtle">{t('Buy')}</Text>
          {currencyB && <TokenAmountDisplay currency={currencyB} amount={originalAmountB ?? '0'} />}
        </FlexGap>
        <FlexGap alignItems="center" justifyContent="space-between">
          <Text color="textSubtle">{t('Limit Price')}</Text>
          <FlexGap alignItems="center" gap="4px">
            <Text small bold>
              1 {isInverted ? currencyB?.symbol : currencyA?.symbol}{' '}
            </Text>
            <IconButton onClick={() => setIsInverted(!isInverted)} variant="text" scale="xs">
              <SwapHorizIcon width="18px" height="18px" color="primary60" />
            </IconButton>{' '}
            <Text small bold>
              {limitPrice || '-'} {isInverted ? currencyA?.symbol : currencyB?.symbol}
            </Text>
          </FlexGap>
        </FlexGap>
        <FlexGap alignItems="center" justifyContent="space-between">
          <Text color="textSubtle">{t('Filled')}</Text>
          <Text>{filledPercentage || '0'}%</Text>
        </FlexGap>
        <FlexGap alignItems="center" justifyContent="space-between">
          <QuestionHelperV2
            text={t(
              'Amount received includes fees earned and order fills. Pending orders may also show amounts if fees were earned during partial fills.',
            )}
          >
            <DottedHelpText style={{ fontSize: '16px' }}>{t('Amount Received')}</DottedHelpText>
          </QuestionHelperV2>

          <AutoColumn gap="4px" justifyItems="flex-end">
            {liveStatus === OrderStatus.Cancelled || liveStatus === OrderStatus.Open ? (
              '-'
            ) : (
              <>
                {currencyA && <TokenAmountDisplay currency={currencyA} amount={amountAReceived ?? '0'} />}
                {currencyB && <TokenAmountDisplay currency={currencyB} amount={amountBReceived ?? '0'} />}
              </>
            )}
          </AutoColumn>
        </FlexGap>

        {(liveStatus === OrderStatus.Open || liveStatus === OrderStatus.PartiallyFilled) && (
          <Button variant="dangerOutline" onClick={handleCancelOrder} width="100%">
            {t('Cancel')}
          </Button>
        )}
        {liveStatus === OrderStatus.Filled && (
          <Button variant="primary60Outline" onClick={handleWithdrawOrder} width="100%">
            {t('Withdraw')}
          </Button>
        )}
      </AutoColumn>
    </MobileOrderCard>
  )
}

export const OrdersTable = () => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  const { data, isLoading } = useUserLimitOrders()

  if (isSmallScreen) {
    return (
      <Box>
        <Pagination borderTop="1px solid" borderBottom="1px solid" borderColor="cardBorder" />

        <ScrollableContainer>
          {data.length === 0 ? (
            <FlexGap py="24px" alignItems="center" justifyContent="center">
              <Text color="textSubtle">{t('No orders found')}</Text>
            </FlexGap>
          ) : (
            data.map((order) => <MobileOrder key={order.order_id} order={order} />)
          )}
        </ScrollableContainer>
      </Box>
    )
  }

  return (
    <Box>
      <Table>
        <Thead>
          <tr>
            <Th>{t('Sell')}</Th>
            <Th>{t('Buy')}</Th>
            <Th>{t('Limit Price')}</Th>
            <Th>{t('Status')}</Th>
            <Th>{t('Filled')}</Th>
            <Th>
              <FlexGap alignItems="center" gap="4px">
                <span>{t('Amount Received')}</span>
                <QuestionHelper
                  color="secondary"
                  text={t(
                    'Amount received includes fees earned and order fills. Pending orders may also show amounts if fees were earned during partial fills.',
                  )}
                />
              </FlexGap>
            </Th>
            <Th>
              <OpenOrdersToggle />
            </Th>
          </tr>
        </Thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <LoadingRow key={index} />)
          ) : data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <FlexGap alignItems="center" justifyContent="center">
                  <Text color="textSubtle">{t('No orders found')}</Text>
                </FlexGap>
              </Td>
            </Tr>
          ) : (
            data?.map((order) => <OrderTableRow key={order.order_id} order={order} />)
          )}
        </tbody>
      </Table>

      <Pagination />
    </Box>
  )
}

const LoadingRow = () => {
  return (
    <Tr>
      <Td>
        <Skeleton height="30px" width="120px" />
      </Td>
      <Td>
        <Skeleton height="30px" width="120px" />
      </Td>
      <Td>
        <Skeleton height="30px" width="150px" />
      </Td>
      <Td>
        <Skeleton height="30px" width="100px" />
      </Td>
      <Td>
        <Skeleton height="30px" />
      </Td>
      <Td>
        <Skeleton height="30px" width="120px" />
      </Td>
      <Td>
        <Skeleton height="30px" />
      </Td>
    </Tr>
  )
}
