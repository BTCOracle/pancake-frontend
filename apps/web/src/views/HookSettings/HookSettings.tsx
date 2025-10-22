import { useTranslation } from '@pancakeswap/localization'
import {
  AutoColumn,
  Box,
  BoxProps,
  DynamicSection,
  Flex,
  FlexGap,
  PreTitle,
  Radio,
  Text,
  Toggle,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { GreyCard } from '@pancakeswap/widgets-internal'
import Divider from 'components/Divider'
import { useCallback } from 'react'
import { useHookAddressQueryState } from 'state/infinity/create'
import { HookSettingsList } from './HookSettingsList'
import { HookSettingsManual } from './HookSettingsManual'
import { useHookEnabledQueryState, useHookSelectTypeQueryState } from './hooks/useQueriesState'
import { HookChangeCb } from './hooks/useSelectHookFromList'

type FieldHookSettingsProps = BoxProps & {
  onHookChange?: HookChangeCb
  onHookEnabledChange?: (enabled: boolean) => void
}

export const HookSettings: React.FC<FieldHookSettingsProps> = ({ onHookChange, onHookEnabledChange, ...boxProps }) => {
  const { t } = useTranslation()
  const { isXs } = useMatchBreakpoints()

  const [hookEnabled, setHookEnabled] = useHookEnabledQueryState()
  const [selectionType, setSelectionType] = useHookSelectTypeQueryState()
  const [, setHookAddress] = useHookAddressQueryState()

  const handleHookSelectTypeChange = useCallback(
    (type: 'list' | 'manual') => {
      setSelectionType(type)
      if (type === 'manual') {
        setHookAddress(null)
      }
    },
    [setSelectionType],
  )

  const handleHookEnabledChange = useCallback(() => {
    const newValue = !hookEnabled
    setHookEnabled(newValue)
    onHookEnabledChange?.(newValue)
  }, [hookEnabled, onHookEnabledChange, setHookEnabled])

  return (
    <Box {...boxProps}>
      <Flex justifyContent="space-between" alignItems="center">
        <PreTitle>{t('Enable Hook Settings')}</PreTitle>
        {hookEnabled !== null ? <Toggle scale="md" checked={hookEnabled} onChange={handleHookEnabledChange} /> : null}
      </Flex>

      <DynamicSection mt="12px" disabled={!hookEnabled}>
        <GreyCard padding="16px">
          <AutoColumn gap="8px">
            <FlexGap gap="24px" flexDirection={isXs ? 'column' : 'row'}>
              <Flex alignItems="center">
                <label htmlFor="radio-hook-selection-1">
                  <Text mr="8px" style={{ whiteSpace: 'nowrap' }}>
                    {t('Select from List')}
                  </Text>
                </label>
                <Radio
                  scale="sm"
                  id="radio-hook-selection-1"
                  name="radio-hook-selection"
                  onChange={() => handleHookSelectTypeChange('list')}
                  checked={selectionType === 'list'}
                />
              </Flex>

              <Flex alignItems="center">
                <label htmlFor="radio-hook-selection-2">
                  <Text mr="8px">{t('Manually')}</Text>
                </label>
                <Radio
                  ml="8px"
                  scale="sm"
                  id="radio-hook-selection-2"
                  name="radio-hook-selection"
                  onChange={() => handleHookSelectTypeChange('manual')}
                  checked={selectionType === 'manual'}
                />
              </Flex>
            </FlexGap>

            {hookEnabled && selectionType ? (
              <>
                <Divider />
                <Box>
                  {selectionType === 'manual' ? (
                    <HookSettingsManual />
                  ) : (
                    <HookSettingsList onHookChange={onHookChange} />
                  )}
                </Box>
              </>
            ) : null}
          </AutoColumn>
        </GreyCard>
      </DynamicSection>
    </Box>
  )
}
