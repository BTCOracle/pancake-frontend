import { useTranslation } from '@pancakeswap/localization'
import { Button, FlexGap, FlexGapProps } from '@pancakeswap/uikit'
import { useCallback, useEffect, useState } from 'react'

import styled, { css } from 'styled-components'

const TabsContainer = styled(FlexGap).attrs({ flexWrap: 'wrap', gap: '4px' })`
  background-color: ${({ theme }) => theme.colors.input};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 1px;

  width: fit-content;

  box-shadow: ${({ theme }) => theme.shadows.inset};
`

const Tab = styled(Button).attrs(({ $isActive, disabled }) => ({
  scale: 'sm',
  variant: $isActive && !disabled ? 'subtle' : 'light',
}))<{
  $isActive?: boolean
  disabled?: boolean
}>`
  height: 32px;
  font-size: 14px;
  padding: 0 12px;

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
      background-color: transparent;

      &:hover {
        opacity: 0.5;
      }
    `}
`

type TabItem = {
  value: string
  label?: string
  disabled?: boolean
}

type TabType = string | TabItem

interface TabMenuProps<T extends TabType> extends FlexGapProps {
  tabs?: T[]
  defaultTab?: T
  onTabChange?: (tab: T) => void
}

export const TabMenu = <T extends TabType>({
  tabs = ['3m', '6m', '1Y', 'All'] as T[],
  defaultTab = '3m' as T,
  onTabChange,
  ...props
}: TabMenuProps<T>) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabChange = useCallback(
    (tab: T) => {
      setActiveTab(tab)
      onTabChange?.(tab)
    },
    [onTabChange],
  )

  // Sync active tab with default tab
  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  return (
    <TabsContainer role="tablist" aria-label={t('Select a tab')} {...props}>
      {tabs.map((tab) => {
        const isActive =
          typeof tab === 'object' && typeof activeTab === 'object' ? tab.value === activeTab.value : tab === activeTab
        return (
          <Tab
            role="tab"
            id={`tab-${JSON.stringify(tab)}`}
            key={JSON.stringify(tab)}
            $isActive={isActive}
            aria-selected={isActive}
            aria-controls={`tabpanel-${JSON.stringify(tab)}`}
            onClick={() => handleTabChange(tab)}
            disabled={Boolean(typeof tab === 'object' && tab.disabled)}
          >
            {typeof tab === 'string' ? tab : tab.label ?? tab.value}
          </Tab>
        )
      })}
    </TabsContainer>
  )
}
