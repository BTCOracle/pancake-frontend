import { useTheme } from '@pancakeswap/hooks'
import { IMultiSelectChangeEvent, IMultiSelectProps, MultiSelect } from '@pancakeswap/uikit'
import { Container } from '@pancakeswap/widgets-internal'
import { useCallback, useState } from 'react'

export const FilterSelect = <T extends string | number>({
  placeholder = 'All',
  data,
  value,
  onChange,
}: {
  placeholder?: string
  data: IMultiSelectProps<T>['options']
  value?: T[]
  onChange: (value: T[]) => void
}) => {
  const { theme } = useTheme()
  const [isShow, setIsShow] = useState(false)

  const handleChange = useCallback((e: IMultiSelectChangeEvent<T>) => onChange(e.value), [onChange])

  return (
    <Container $isShow={isShow}>
      <MultiSelect
        multiple
        style={{
          backgroundColor: theme.colors.input,
        }}
        panelStyle={{
          backgroundColor: theme.colors.input,
        }}
        scrollHeight="30vh"
        options={data}
        isShowSelectAll={false}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onShow={() => setIsShow(true)}
        onHide={() => setIsShow(false)}
      />
    </Container>
  )
}
