import { Trans, useTranslation } from '@pancakeswap/localization'
import { FlexGap, Button, useMatchBreakpoints, RowBetween, Text, Box, Input, Message, Link } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { useAtomValue, useSetAtom } from 'jotai'
import { ChangeEvent, Suspense, useCallback, useEffect, useState } from 'react'
import { BigNumber as BN } from 'bignumber.js'
import currencyId from 'utils/currencyId'
import { customMarketPriceAtom } from '../state/form/customMarketPriceAtom'
import {
  differencePercentageAtom,
  presetPercentMapAtom,
  setPercentDifferenceAtom,
} from '../state/form/quickActionAtoms'
import { DEFAULT_PERCENTAGE_MAP } from '../constants'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { ticksAtom } from '../state/form/ticksAtom'

// Quick Select Styles
const ButtonsContainer = styled(FlexGap).attrs({ gap: '8px' })`
  background-color: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: ${({ theme }) => theme.radii.default};
  box-shadow: ${({ theme }) => theme.shadows.inset2};
`

const QuickActionButton = styled(Button).attrs(({ $isActive }) => ({
  scale: 'xs',
  variant: $isActive ? 'subtle' : 'light',
}))<{
  $isActive?: boolean
}>`
  height: 44px;
  font-size: 16px;
  padding: 0 12px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
`

const CustomInputContainer = styled(Box)<{ $small?: boolean }>`
  position: relative;
  max-width: 160px;

  ${({ $small }) =>
    $small
      ? `
          height: 40px;
          width: 30%;
        `
      : `
          height: 40px;
          width: 120%;
          margin: auto 1px auto 0;
        `}
`

const StyledInput = styled(Input)<{ $isValid?: boolean }>`
  height: 100%;
  font-size: 16px;
  text-align: center;
  padding-left: 8px !important;
  padding-right: 32px !important;
  box-shadow: none;
  border: ${({ theme, $isValid }) =>
    $isValid === false ? `1px solid ${theme.colors.failure}` : `1px solid ${theme.colors.inputSecondary}`};
`

const PercentageLabel = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};

  display: flex;
  align-items: center;
  gap: 4px;
`

const VerticalLine = styled.div`
  display: inline-block;
  height: 24px;
  width: 1px;
  background-color: ${({ theme }) => theme.colors.inputSecondary};
`

export const QuickActionButtons = () => {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  const [localPercent, setLocalPercent] = useState('')

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const percentage = useAtomValue(differencePercentageAtom)
  const presetPercentMap = useAtomValue(presetPercentMapAtom)

  const setCustomMarketPrice = useSetAtom(customMarketPriceAtom)
  const setPercentDifference = useSetAtom(setPercentDifferenceAtom)

  const ticksData = useAtomValue(ticksAtom)
  const { isSellingOrBuyingAtWorsePrice } = ticksData || { isSellingOrBuyingAtWorsePrice: false }

  const handleCustomInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalPercent(val)
  }, [])

  const handleBlur = useCallback(() => {
    if (BN(localPercent).isZero()) {
      setCustomMarketPrice(undefined)
      return
    }

    if (localPercent && BN(localPercent).isFinite() && localPercent !== percentage)
      setPercentDifference(Number(localPercent))
    else setLocalPercent(percentage || '')
  }, [localPercent, setPercentDifference, percentage])

  // Sync percent values
  useEffect(() => {
    setLocalPercent(percentage || '')
  }, [percentage])

  if (!inputCurrency || !outputCurrency) return null

  return (
    <Suspense>
      <ButtonsContainer>
        <QuickActionButton
          $isActive={percentage === undefined}
          onClick={() => setCustomMarketPrice(undefined)}
          width={isSmallScreen ? '150%' : '200%'}
          minWidth="max-content"
        >
          {t('Market')}
        </QuickActionButton>

        {Object.keys(DEFAULT_PERCENTAGE_MAP).map((item) => {
          return (
            <QuickActionButton
              key={item}
              onClick={() => setPercentDifference(Number(item))}
              $isActive={percentage === presetPercentMap[item]}
              width="100%"
            >
              +{item}%
            </QuickActionButton>
          )
        })}

        {!isSmallScreen && (
          <CustomInputContainer width="120%" minWidth="110px">
            <StyledInput
              value={localPercent}
              onChange={handleCustomInput}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder={t('Custom')}
              type="text"
              inputMode="decimal"
            />
            <PercentageLabel>
              <VerticalLine />
              <span>%</span>
            </PercentageLabel>
          </CustomInputContainer>
        )}
      </ButtonsContainer>
      {isSmallScreen && (
        <RowBetween mt="8px" alignItems="center">
          <Text color="textSubtle">{t('Custom')}</Text>
          <CustomInputContainer $small>
            <StyledInput
              value={localPercent}
              onChange={handleCustomInput}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="2.5"
              type="text"
              inputMode="decimal"
            />
            <PercentageLabel>
              <VerticalLine />
              <span>%</span>
            </PercentageLabel>
          </CustomInputContainer>
        </RowBetween>
      )}
      {isSellingOrBuyingAtWorsePrice && (
        <Message variant="warning" mt="2px">
          <Box>
            <Text as="span" small>
              <Trans
                i18nTemplate="Limit price is %percent%% lower than market, you are selling at a much lower rate. We recommend that you use <0>Swap</0> instead."
                components={[
                  <Link
                    style={{ display: 'inline-block' }}
                    key="swap"
                    href={`/swap?inputCurrencyId=${currencyId(inputCurrency)}&outputCurrencyId=${currencyId(
                      outputCurrency,
                    )}`}
                    color="primary60"
                    small
                  />,
                ]}
                values={{
                  percent: Math.abs(Number(percentage ?? 0)),
                }}
              />
            </Text>
          </Box>
        </Message>
      )}
    </Suspense>
  )
}
