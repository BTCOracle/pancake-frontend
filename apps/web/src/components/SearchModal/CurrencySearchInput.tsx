import { useTranslation } from '@pancakeswap/localization'
import { Input, InputProps } from '@pancakeswap/uikit'
import { RefObject, useRef } from 'react'

interface CurrencySearchInputProps extends InputProps {
  value?: string
  compact?: boolean
  inputRef?: ReturnType<typeof useRef<HTMLInputElement>> | null
  handleEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onInput?: (event: React.ChangeEvent<HTMLInputElement>) => void
  autoFocus?: boolean
}

export const CurrencySearchInput = ({
  value,
  inputRef = null,
  compact = false,
  handleEnter,
  onInput,
  autoFocus = true,
  ...props
}: CurrencySearchInputProps) => {
  const { t } = useTranslation()

  return (
    <Input
      id="token-search-input"
      placeholder={t('Search name / address')}
      scale={compact ? 'md' : 'lg'}
      autoComplete="off"
      value={value}
      ref={inputRef as RefObject<HTMLInputElement>}
      onChange={onInput}
      onKeyDown={handleEnter}
      autoFocus={autoFocus}
      {...props}
    />
  )
}
