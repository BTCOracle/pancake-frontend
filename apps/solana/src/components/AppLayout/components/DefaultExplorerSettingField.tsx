import { Flex, HStack, Image, Text } from '@chakra-ui/react'
import { Button } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useEvent } from '@/hooks/useEvent'
import { EXPLORER_KEY, supportedExplorers, useAppStore } from '@/store'
import { setStorageItem } from '@/utils/localStorage'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'

export function DefaultExplorerSettingField() {
  const { t } = useTranslation()
  const isMobile = useAppStore((s) => s.isMobile)
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const handleChange = useEvent((val: string) => {
    useAppStore.setState({ explorerUrl: val }, false, { type: 'DefaultExplorerSettingField' })
    setStorageItem(EXPLORER_KEY, val)
  })

  const defaultExplorer = supportedExplorers.find((e) => e.host === explorerUrl)
  const defaultExplorerName = defaultExplorer?.name

  return (
    <SettingField
      fieldName={t('Default Explorer')}
      tooltip={t('Select preferred block explorer')}
      renderToggleButton={
        isMobile
          ? (isOpen) => (
              <SettingFieldToggleButton
                isOpen={isOpen}
                renderContent={
                  <HStack spacing={1.5}>
                    <Image src={defaultExplorer?.icon} boxSize="18px" alt={defaultExplorerName} />
                    <Text fontWeight={500} lineHeight={0}>
                      {defaultExplorerName}
                    </Text>
                  </HStack>
                }
              />
            )
          : null
      }
      renderWidgetContent={
        <Flex flexWrap="wrap" gap={4}>
          {supportedExplorers.map((explorer) => (
            <Button
              key={explorer.name}
              variant={explorerUrl === explorer.host ? 'primary' : 'tertiary'}
              scale="sm"
              onClick={() => handleChange(explorer.host)}
            >
              <HStack spacing={1.5}>
                <Image src={explorer.icon} boxSize="18px" alt={explorer.name} />
                <Text fontWeight={500} lineHeight={0}>
                  {explorer.name}
                </Text>
              </HStack>
            </Button>
          ))}
        </Flex>
      }
    />
  )
}
