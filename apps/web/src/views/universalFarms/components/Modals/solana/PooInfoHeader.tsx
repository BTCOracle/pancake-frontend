import { Protocol } from '@pancakeswap/farms'
import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, FeeTier, FlexGap, Heading } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo } from '@pancakeswap/widgets-internal'
import { RangeTag } from 'components/RangeTag'
import { POSITION_STATUS, SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'

type SolanaV3PoolInfoHeaderProps = {
  poolInfo: SolanaV3Pool
  position: SolanaV3PositionDetail
  currency0: UnifiedCurrency
  currency1: UnifiedCurrency
}

export const SolanaV3PoolInfoHeader: React.FC<SolanaV3PoolInfoHeaderProps> = ({
  poolInfo,
  currency0,
  currency1,
  position,
}) => {
  return (
    <AutoColumn gap="16px" mb="16px">
      <FlexGap gap="16px" alignItems="center">
        <DoubleCurrencyLogo
          size={40}
          currency0={currency0}
          currency1={currency1}
          showChainLogoCurrency1
          margin={false}
          innerMargin="-8px"
        />
        <FlexGap gap="4px" alignItems="center">
          <Heading as="h2">{poolInfo.mintA.symbol}</Heading>
          <Heading as="h2" color="textSubtle">
            /
          </Heading>
          <Heading as="h2">{poolInfo.mintB.symbol}</Heading>
        </FlexGap>
        <FeeTier type={Protocol.V3} fee={poolInfo.feeRate} denominator={1} />
      </FlexGap>
      <FlexGap gap="16px" alignItems="center">
        <RangeTag
          scale="sm"
          lowContrast
          removed={position.liquidity.isZero()}
          outOfRange={position.status === POSITION_STATUS.INACTIVE}
          protocol={Protocol.V3}
        />
      </FlexGap>
    </AutoColumn>
  )
}
