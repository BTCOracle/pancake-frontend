import { usePreviousValue } from '@pancakeswap/hooks'
import { POOL_TYPE, PoolType } from '@pancakeswap/infinity-sdk'
import styled from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  BoxProps,
  ButtonMenu,
  ButtonMenuItem,
  DynamicSection,
  ErrorIcon,
  FlexGap,
  Input,
  InputGroup,
  PreTitle,
  QuestionHelper,
  Text,
  Toggle,
  useMatchBreakpoints,
  Select,
} from '@pancakeswap/uikit'
import type { OptionProps } from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { useSolanaClmmFeeTiers } from 'hooks/solana/useSolanaClmmFeeTiers'
import { useFeeLevelQueryState, useFeeTierSettingQueryState } from 'state/infinity/create'
import { escapeRegExp } from 'utils'
import { useInfinityCreateFormQueryState } from '../hooks/useInfinityFormState/useInfinityFormQueryState'
import { PRESET_FEE_LEVELS_INFINITY } from '../constants'

export type FieldFeeLevelProps = {
  allowCustomFee?: boolean
} & BoxProps

const decimals = 4

const FEE_LIMIT = {
  [POOL_TYPE.Bin]: 10,
  [POOL_TYPE.CLAMM]: 100,
}

export const isFeeOutOfRange = (fee?: number | null, poolType?: PoolType) => {
  if (!fee || !poolType) {
    return false
  }
  return poolType === POOL_TYPE.CLAMM ? fee >= FEE_LIMIT[POOL_TYPE.CLAMM] : fee >= FEE_LIMIT[POOL_TYPE.Bin]
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group

export const FieldFeeLevel: React.FC<FieldFeeLevelProps> = ({ allowCustomFee, ...boxProps }) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const [feeLevel, setFeeLevel] = useFeeLevelQueryState()
  const [feeTierSetting, setFeeTierSetting] = useFeeTierSettingQueryState()

  const { poolType } = useInfinityCreateFormQueryState()
  const [inputValue, setInputValue] = useState<string | null>(null)
  const { chainId } = useActiveChainId()
  const solanaFeeTiers = useSolanaClmmFeeTiers()

  // Build dynamic options depending on chain (Solana uses CLMM config)
  const options = useMemo(() => {
    if (chainId === NonEVMChainId.SOLANA) {
      return solanaFeeTiers
    }
    return PRESET_FEE_LEVELS_INFINITY
  }, [chainId, solanaFeeTiers])

  const tips = useMemo(() => {
    if (!feeLevel || feeTierSetting === 'dynamic') return null
    if (isFeeOutOfRange(feeLevel, poolType)) {
      return (
        <FlexGap gap="6px" mt="8px">
          <ErrorIcon color="failure" />
          <Text color="failure">
            {t('The fee must be below %amount%%', {
              amount: poolType === POOL_TYPE.CLAMM ? FEE_LIMIT[POOL_TYPE.CLAMM] : FEE_LIMIT[POOL_TYPE.Bin],
            })}
          </Text>
        </FlexGap>
      )
    }
    if (feeLevel > 0.3) {
      return (
        <FlexGap gap="6px" mt="8px">
          <ErrorIcon color="yellow" />
          <Text color="yellow">{t('Consider lowering the fee')}</Text>
        </FlexGap>
      )
    }
    return null
  }, [feeTierSetting, poolType, feeLevel, t])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let { value: v } = e.target

    v = v.replace(/,/g, '.')

    if (inputRegex.test(escapeRegExp(v))) {
      const d = v.split('.')[1]?.length
      if (d && d > decimals) return
      setInputValue(v)
    }
  }, [])

  const handleInputBlur = useCallback(() => {
    if (inputValue === null) return
    if (inputValue === '') {
      setFeeLevel(null)
      return
    }
    const value = parseFloat(inputValue)
    setFeeLevel(value)
    setInputValue(value.toString())
  }, [inputValue, setFeeLevel])

  const handleQuickSelect = useCallback(
    (presetFeeLevel: number) => {
      setFeeLevel(presetFeeLevel)
      setInputValue(presetFeeLevel.toString())
    },
    [setFeeLevel],
  )

  const handleMenuItemClick = useCallback(
    (index: number) => {
      if (index < options.length) {
        handleQuickSelect(options[index])
      }
      // For custom fee input, we don't need to do anything here
      // as the input will be handled separately
    },
    [handleQuickSelect, options],
  )

  const handleFeeTierSettingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFeeTierSetting(e.target.checked ? 'dynamic' : 'static')
    },
    [setFeeTierSetting],
  )

  const activeIndex = useMemo(() => {
    const presetIndex = options.findIndex((preset) => preset === feeLevel)
    if (presetIndex !== -1) {
      return presetIndex
    }

    // If custom fee or unknown fee level is set, don't set it to active
    return -1
  }, [feeLevel, options])

  const prevFeeLevel = usePreviousValue(feeLevel)

  useEffect(() => {
    if (inputValue === null && feeLevel !== null) {
      setInputValue(parseFloat(feeLevel.toFixed(decimals)).toString())
    }
  }, [feeLevel, inputValue])

  useEffect(() => {
    if (prevFeeLevel !== null && feeLevel === null) {
      setInputValue(null)
    }
  }, [feeLevel, prevFeeLevel])

  // Build Select options and change handler (Solana)
  const selectOptions: OptionProps[] = useMemo(
    () => options.map((v) => ({ label: `${v / 1e4}%`, value: String(v) })),
    [options],
  )

  const handleSelectChange = useCallback(
    (opt: OptionProps) => {
      const v = Number(opt.value)
      if (!Number.isNaN(v)) {
        handleQuickSelect(v)
      }
    },
    [handleQuickSelect],
  )

  return (
    <Box {...boxProps}>
      <FlexGap justifyContent="space-between" alignItems="center">
        <FlexGap gap="4px">
          <PreTitle mb="8px">{t('Fee Level')}</PreTitle>
          <QuestionHelper
            placement="auto"
            mb="8px"
            color="secondary"
            text={t('Common range: 0.01% to 0.3%, Ideal range <1%')}
          />
        </FlexGap>

        {chainId !== NonEVMChainId.SOLANA && (
          <FlexGap gap="4px" alignItems="center">
            <PreTitle>{t('Dynamic Fee')}</PreTitle>
            <QuestionHelper
              color="secondary"
              placement="auto"
              text={
                <>
                  <Text>{t('Static: The fee remains fixed at the specified level once the pool is created.')}</Text>
                  <Text mt="12px">
                    {t(
                      'Dynamic: The fee can be modified using hook after the pool is created. Initial fee level is set to 0',
                    )}
                  </Text>
                </>
              }
            />
            <Toggle checked={feeTierSetting === 'dynamic'} onChange={handleFeeTierSettingChange} scale="sm" />
          </FlexGap>
        )}
      </FlexGap>

      {chainId === NonEVMChainId.SOLANA ? (
        <Select
          options={selectOptions}
          defaultOptionIndex={activeIndex >= 0 ? activeIndex : 0}
          onOptionChange={handleSelectChange}
        />
      ) : (
        <DynamicSection disabled={feeTierSetting === 'dynamic'}>
          <ButtonMenu
            activeIndex={activeIndex}
            onItemClick={handleMenuItemClick}
            variant="subtle"
            fullWidth={!isMobile}
            scale={isMobile ? 'sm' : 'md'}
          >
            <ButtonMenuItem padding={isMobile ? '0 8px' : '0 16px'}>{PRESET_FEE_LEVELS_INFINITY[0]}%</ButtonMenuItem>
            <ButtonMenuItem padding={isMobile ? '0 8px' : '0 16px'}>{PRESET_FEE_LEVELS_INFINITY[1]}%</ButtonMenuItem>
            <ButtonMenuItem padding={isMobile ? '0 8px' : '0 16px'}>{PRESET_FEE_LEVELS_INFINITY[2]}%</ButtonMenuItem>

            {allowCustomFee ? (
              <ButtonMenuItem padding="0">
                <InputGroup scale={isMobile ? 'sm' : 'md'} endIcon={<>%</>}>
                  <StyledInput
                    pattern={`^[0-9]*[.,]?[0-9]{0,${decimals}}$`}
                    inputMode="decimal"
                    placeholder={t('Custom')}
                    step="0.01"
                    min="0"
                    max="100"
                    value={inputValue ?? ''}
                    onBlur={handleInputBlur}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </ButtonMenuItem>
            ) : (
              <></>
            )}
          </ButtonMenu>
        </DynamicSection>
      )}

      {tips}
    </Box>
  )
}

const StyledInput = styled(Input)`
  border: none;
  width: 100%;

  min-width: 80px;

  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 120px;
  }
`
