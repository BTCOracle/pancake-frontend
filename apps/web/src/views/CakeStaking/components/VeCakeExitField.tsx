import { useTranslation } from '@pancakeswap/localization'
import { Flex, Text, TooltipText, useTooltip } from '@pancakeswap/uikit'
import { getBalanceAmount } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import React, { ReactElement } from 'react'
import styled from 'styled-components'
import formatLocaleNumber from 'utils/formatLocaleNumber'
import { getDisplayValue } from '../utils/useDisplayValue'

type FieldProps = {
  label: string
  labelTooltip?: string
  value: ReactElement | number | BigNumber
  valueStyles?: React.CSSProperties
  valueTooltip?: string | ReactElement
  symbol?: string
  usdValue?: number | BigNumber
}

export const DisplayValue = ({
  value,
  symbol,
  style,
  className,
}: {
  value: number | ReactElement | BigNumber
  symbol?: string
  style?: React.CSSProperties
  className?: string
}): ReactElement => {
  const {
    currentLanguage: { locale },
  } = useTranslation()

  if (typeof value === 'number' || value instanceof BigNumber) {
    const display = getDisplayValue(value, locale)
    if (display === '-') {
      return <ValueText className={className}>-</ValueText>
    }

    return (
      <ValueText style={style} className={className}>
        {display}
        {symbol && <SymbolText>&nbsp;{symbol}</SymbolText>}
      </ValueText>
    )
  }
  return value
}

export const DisplayUSDValue = ({ value }: { value?: number | BigNumber }): ReactElement | null => {
  const {
    currentLanguage: { locale },
  } = useTranslation()
  if (!value) {
    return null
  }
  const val = value instanceof BigNumber ? getBalanceAmount(value).toNumber() : value
  const formattedValue = formatLocaleNumber({
    number: val,
    locale,
    sigFigs: 4,
  })
  if (val === 0) {
    return <UsdValueText>-</UsdValueText>
  }
  return <UsdValueText>{`~($${formattedValue} USD)`}</UsdValueText>
}

export const VeCakeExitField: React.FC<FieldProps> = ({
  label,
  labelTooltip,
  valueTooltip,
  value,
  symbol,
  usdValue,
  valueStyles,
}) => {
  return (
    <FieldWrapper justifyContent="space-between" alignItems="flex-start">
      <LabelWrapper>
        <Tooltip visible={Boolean(labelTooltip)} tooltip={<Text>{labelTooltip}</Text>}>
          <LabelText>{label}</LabelText>
        </Tooltip>
      </LabelWrapper>
      <ValueWrapper>
        <Tooltip visible={Boolean(valueTooltip)} tooltip={<Text>{valueTooltip}</Text>}>
          <DisplayValue style={valueStyles} value={value} symbol={symbol} />
        </Tooltip>
        <DisplayUSDValue value={usdValue} />
      </ValueWrapper>
    </FieldWrapper>
  )
}

const Tooltip = ({
  tooltip,
  children,
  visible,
}: {
  tooltip?: ReactElement
  children: ReactElement
  visible: boolean
}) => {
  const tooltipObj = useTooltip(tooltip)

  return (
    <>
      {visible && tooltipObj.tooltip}
      {visible && <TooltipText ref={tooltipObj.targetRef}>{children}</TooltipText>}
      {!visible && children}
    </>
  )
}

// Styled components
const FieldWrapper = styled(Flex)`
  width: 100%;
  margin-bottom: 8px;
`

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const LabelText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-family: Kanit;
  font-weight: 400;
  font-size: 14px;
  line-height: 120%;
  letter-spacing: 0px;
  vertical-align: middle;
`

const ValueWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const ValueText = styled(Text)`
  font-family: Kanit;
  font-weight: 400;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0%;
  vertical-align: middle;
`

const SymbolText = styled.span``

const UsdValueText = styled(Text)`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-family: Kanit;
  font-weight: 400;
  font-size: 12px;
  line-height: 120%;
  letter-spacing: 0px;
  text-align: right;
`
