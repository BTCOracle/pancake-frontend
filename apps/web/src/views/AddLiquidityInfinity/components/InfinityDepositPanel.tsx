import { Box, Card, CardBody, Column, Row, RowBetween, Text } from '@pancakeswap/uikit'
import { useCurrencyByPoolId } from 'hooks/infinity/useCurrencyByPoolId'
import { useMemo } from 'react'
import { useInverted } from 'state/infinity/shared'
import styled from 'styled-components'
import { Address } from 'viem'
import { MevProtectToggle } from 'views/Mev/MevProtectToggle'
import { FieldAddDepositAmount } from './FieldAddDepositAmount'
import { SubmitButton } from './SubmitButton'

const StyledCard = styled(Card)`
  height: fit-content;
`

interface InfinityDepositPanelProps {
  poolId?: Address
  chainId?: number
}

export const InfinityDepositPanel = ({ poolId, chainId }: InfinityDepositPanelProps) => {
  const { currency0: currency0Base, currency1: currency1Base } = useCurrencyByPoolId({ chainId, poolId })
  const [inverted] = useInverted()

  const currency0 = useMemo(() => (inverted ? currency1Base : currency0Base), [inverted, currency0Base, currency1Base])
  const currency1 = useMemo(() => (inverted ? currency0Base : currency1Base), [inverted, currency0Base, currency1Base])

  return (
    <StyledCard>
      <CardBody>
        <FieldAddDepositAmount baseCurrency={currency0} quoteCurrency={currency1} />

        <Box mt="16px">
          <MevProtectToggle size="sm" />
        </Box>
        <SubmitButton mt="16px" />
      </CardBody>
    </StyledCard>
  )
}
