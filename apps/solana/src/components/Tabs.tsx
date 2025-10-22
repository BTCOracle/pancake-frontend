import { ButtonMenuProps, ButtonMenu, ButtonMenuItem, type ButtonMenuItemProps } from '@pancakeswap/uikit'
import { Scale, Variant } from '@pancakeswap/uikit/components/Button/types'
import { TabListProps as CTabListProps, SystemStyleObject, TooltipProps } from '@chakra-ui/react'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useEvent } from '@/hooks/useEvent'
import { shrinkToValue } from '@/utils/shrinkToValue'

type TabOptionsObj = {
  value: string
  label?: ReactNode | ((isActive: boolean) => ReactNode)
  defaultChecked?: boolean
  disabled?: boolean
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export type TabItem<T extends string = string> = (TabOptionsObj & { value: T }) | T

type TabsProps<T extends string> = Omit<ButtonMenuProps, 'children' | 'variant'> & {
  isFitted?: boolean
  size?: Scale | 'lg'
  items: readonly TabItem<T>[]
  variant?:
    | Variant
    | 'line'
    | 'square'
    | 'rounded'
    | 'folder'
    | 'roundedLight'
    | 'roundedPlain'
    | 'roundedSwitch'
    | 'squarePanel'
    | 'squarePanelDark'

  tabListSX?: CTabListProps['sx']
  onChange?: (value: T) => void
  value?: T
  defaultValue?: T

  renderItem?(itemValue?: T, idx?: number): ReactNode
  tabItemSX?: ButtonMenuItemProps & SystemStyleObject
}

export default function Tabs<T extends string = string>({
  items: rawOptions,
  size = 'sm',
  variant = 'subtle',
  onChange,
  value,
  defaultValue,
  renderItem,
  tabItemSX = {},
  ...rest
}: TabsProps<T>) {
  const options = useMemo(() => rawOptions.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)), [rawOptions])
  const inputValueIndex = useMemo(
    () => (value ? options.findIndex((option) => option.value === value && !option.disabled) : undefined),
    [options, value]
  )
  const defaultInputValueIndex = useMemo(
    () => (defaultValue ? options.findIndex((option) => option.value === defaultValue && !option.disabled) : undefined),
    [defaultValue, options]
  )
  const [activeIndex, setActiveIndex] = useState(inputValueIndex ?? defaultInputValueIndex)
  const syncActiveIndexState = useCallback((idx: number) => setActiveIndex(idx), [])

  useEffect(() => {
    if (inputValueIndex != null) {
      syncActiveIndexState(inputValueIndex)
    }
  }, [inputValueIndex, syncActiveIndexState])

  const onTabChange = useEvent((idx: number) => {
    if (options[idx].disabled) return
    onChange?.(options[idx].value)
  })

  const handleItemClick = useCallback(
    (idx: number) => {
      syncActiveIndexState(idx)
      onTabChange(idx)
    },
    [syncActiveIndexState, onTabChange]
  )

  return (
    <ButtonMenu scale={size as any} activeIndex={activeIndex} onItemClick={handleItemClick} variant={variant as any} {...rest}>
      {options.map((option, idx) => (
        <ButtonMenuItem key={`${option.value}`} {...tabItemSX}>
          {renderItem?.(option.value, idx) ?? shrinkToValue(option.label, [activeIndex === idx]) ?? option.value}
        </ButtonMenuItem>
      ))}
    </ButtonMenu>
  )
}
