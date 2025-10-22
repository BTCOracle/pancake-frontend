import { Flex, InputGroup, NumberInput, NumberInputField, SystemStyleObject, Text } from '@chakra-ui/react'
import React, { MouseEvent, KeyboardEvent, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import Decimal from 'decimal.js'
import { formatToRawLocaleStr, detectedSeparator } from '@/utils/numberish/formatter'
import { numberRegExp, extractNumberOnly } from '@/utils/numberish/regex'
import { inputCard } from '@/theme/cssBlocks'

interface Props {
  id?: string
  name?: string
  title?: ReactNode
  readonly?: boolean
  disabled?: boolean
  loading?: boolean
  value: string
  side?: string
  balance?: string
  decimals?: number
  ctrSx?: SystemStyleObject
  inputSx?: SystemStyleObject
  inputGroupSx?: SystemStyleObject
  prefix?: ReactNode
  postfix?: ReactNode
  postFixInField?: boolean
  rightAddOn?: ReactNode
  placeholder?: string
  width?: string
  height?: string
  variant?: string
  min?: number
  max?: number
  onClick?: (e: MouseEvent<HTMLInputElement>) => void
  onChange?: (val: string, valNumber: number, side?: string) => void
  onFormikChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (val: string) => void
  onFocus?: (side?: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}

function DecimalInput(props: Props) {
  const {
    id,
    name,
    title,
    width = '100%',
    height,
    onChange,
    onFormikChange,
    onBlur,
    onFocus,
    onClick,
    onKeyDown,
    ctrSx = {},
    inputSx = {},
    inputGroupSx = {},
    prefix,
    postfix,
    decimals,
    side,
    readonly,
    disabled,
    value,
    min,
    max,
    placeholder,
    variant = 'filled',
    postFixInField = false,
    rightAddOn
  } = props
  const valRef = useRef(value)
  valRef.current = value

  const clampValueOnBlur = min !== undefined || max !== undefined
  const handleValidate = useCallback((value_: string) => {
    return numberRegExp.test(value_)
  }, [])

  const handleChange = useCallback(
    (val: string, valNumber: number) => {
      valRef.current = val
      onChange?.(val, valNumber, side)
    },
    [onChange, side, decimals]
  )

  const handleBlur = useCallback(() => {
    setTimeout(() => onBlur?.(valRef.current), 0)
  }, [onBlur, side])

  const handleParseVal = useCallback(
    (propVal: string) => {
      const val = propVal.match(new RegExp(`[0-9,.]`, 'gi'))?.join('') || ''
      if (!val) return ''
      const valNumber = val.replace(',', '.')
      const splits = valNumber.split('.')
      if (splits.length > 2) return `${splits[0]}.${splits.slice(1).join('')}`
      return valNumber === '.' ? '0.' : valNumber
    },
    [decimals]
  )

  const handleFocus = useCallback(() => {
    onFocus?.(side)
  }, [onFocus, side])

  useEffect(() => {
    // parse first time
    // const val = handleParseVal(valRef.current)
    const val = valRef.current
    handleChange(val, Number(val))
  }, [handleChange])

  const shakeValueDecimal = (value_: number | string | undefined, decimals_?: number) =>
    value_ && !String(value_).endsWith('.') && decimals_ != null && new Decimal(extractNumberOnly(value_, 0)).decimalPlaces() > decimals_
      ? new Decimal(value_).toDecimalPlaces(decimals_, Decimal.ROUND_FLOOR).toString()
      : value_

  // shaked decimal
  const showedValue = useMemo(() => shakeValueDecimal(value, decimals), [value, decimals])
  return (
    <Flex flexDirection="column" width={width} opacity={disabled ? '0.5' : '1'} {...inputCard} sx={ctrSx}>
      {title ? (
        <Text mb="6px" minW="40px">
          {title}
        </Text>
      ) : null}
      <Flex alignItems="center" w="100%">
        {prefix}
        <InputGroup sx={{ width, height, px: 2, ...inputGroupSx }}>
          <NumberInput
            focusInputOnChange={false}
            clampValueOnBlur={clampValueOnBlur}
            id={id}
            name={name}
            min={min}
            max={max}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            parse={handleParseVal}
            isReadOnly={readonly}
            isDisabled={disabled || false}
            isInvalid={clampValueOnBlur ? undefined : false}
            value={showedValue}
            format={formatToRawLocaleStr}
            // precision={decimals}
            width={width}
            variant={variant}
            isValidCharacter={handleValidate}
          >
            <NumberInputField
              px="0px"
              sx={inputSx}
              cursor={readonly ? 'default' : undefined}
              id={id}
              name={name}
              placeholder={placeholder}
              width={width}
              height={height}
              onClick={onClick}
              onChange={onFormikChange}
              onKeyDown={onKeyDown}
            />
          </NumberInput>
          {postfix && postFixInField ? postfix : null}
        </InputGroup>
        {postFixInField ? (
          rightAddOn
        ) : (
          <>
            {postfix}
            {rightAddOn}
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default DecimalInput
