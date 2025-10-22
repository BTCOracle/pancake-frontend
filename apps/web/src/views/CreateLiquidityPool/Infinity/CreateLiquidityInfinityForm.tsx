import { useMemo } from 'react'
import { AutoColumn, Card, CardBody, DynamicSection, Grid, Spinner } from '@pancakeswap/uikit'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { FieldLiquidityShape } from 'components/Liquidity/Form/FieldLiquidityShape'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { FieldBinStep } from 'views/CreateLiquidityPool/components/FieldBinStep'
import { FieldClTickSpacing } from 'views/CreateLiquidityPool/components/FieldClTickSpacing'
import { FieldFeeLevel } from 'views/CreateLiquidityPool/components/FieldFeeLevel'
import { FieldHookSettings } from 'views/CreateLiquidityPool/components/FieldHookSettings'
import { FieldSelectCurrencies } from 'views/CreateLiquidityPool/components/FieldSelectCurrencies'
import { MevProtectToggle } from 'views/Mev/MevProtectToggle'
import { FieldStartingPrice } from 'views/CreateLiquidityPool/components/FieldStartingPrice'
import { FieldCreateDepositAmount } from '../components/FieldCreateDepositAmount'
import { FieldPoolType } from '../components/FieldPoolType'
import { FieldPriceRange } from '../components/FieldPriceRange'
import { MessagePoolInitialized } from '../components/MessagePoolInitialized'
import { SubmitCreateButton } from '../components/SubmitCreateButton'
import {
  useInfinityCLQueryState,
  useInfinityBinQueryState,
  useInfinityCreateFormQueryState,
} from '../hooks/useInfinityFormState/useInfinityFormQueryState'
import { usePoolKey } from '../hooks/useInfinityFormState/usePoolKey'
import { useIsPoolInitialized } from '../hooks/useIsPoolInitialized'
import { ResponsiveTwoColumns } from '../styles'
import { FieldSlippageTolerance } from '../components/FieldSlippageTolerance'

export const CreateLiquidityInfinityForm = () => {
  const { chainId } = useSelectIdRouteParams()

  const { isBin, isCl, startPrice, feeLevel, isDynamic } = useInfinityCreateFormQueryState()

  const { lowerBinId, upperBinId } = useInfinityBinQueryState()
  const { lowerTick, upperTick } = useInfinityCLQueryState()

  const poolKey = usePoolKey()
  const { data: poolInitialized } = useIsPoolInitialized(poolKey, chainId)

  const isRangeEntered = useMemo(() => {
    if (isBin) {
      return lowerBinId !== null && upperBinId !== null
    }
    return lowerTick !== null && upperTick !== null
  }, [isBin, lowerBinId, upperBinId, lowerTick, upperTick])

  // Show loading animation while we wait for chainId
  if (!chainId) {
    return (
      <Grid style={{ placeItems: 'center', minHeight: '50vh' }}>
        <Spinner />
      </Grid>
    )
  }

  return (
    <Grid gridTemplateColumns={['1fr', '1fr', '1fr', 'repeat(2, 1fr)']} style={{ gap: '24px' }}>
      <Card style={{ height: 'fit-content' }}>
        <CardBody>
          <AutoColumn gap="24px">
            <FieldSelectCurrencies />
            <ResponsiveTwoColumns>
              <FieldPoolType />
              {isBin && <FieldBinStep />}
              {isCl && <FieldClTickSpacing />}
            </ResponsiveTwoColumns>
            <FieldFeeLevel allowCustomFee />
            <FieldHookSettings />
            <MessagePoolInitialized />
          </AutoColumn>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <DynamicSection disabled={poolInitialized || (!isDynamic && isUndefinedOrNull(feeLevel))}>
            <AutoColumn gap={['16px', null, null, '24px']}>
              <FieldStartingPrice />
              <DynamicSection disabled={!startPrice}>
                <AutoColumn gap={['16px', null, null, '24px']}>
                  <FieldPriceRange />
                  {isBin && <FieldLiquidityShape />}
                </AutoColumn>
              </DynamicSection>
              <DynamicSection disabled={!startPrice || !isRangeEntered}>
                <AutoColumn gap={['16px', null, null, '24px']}>
                  <FieldCreateDepositAmount />
                  <FieldSlippageTolerance />
                  <MevProtectToggle />
                  <SubmitCreateButton />
                </AutoColumn>
              </DynamicSection>
            </AutoColumn>
          </DynamicSection>
        </CardBody>
      </Card>
    </Grid>
  )
}
