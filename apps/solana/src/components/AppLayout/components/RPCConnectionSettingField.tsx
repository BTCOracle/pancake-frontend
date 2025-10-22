import { Flex, Input, InputGroup, InputRightElement, Spinner, useDisclosure } from '@chakra-ui/react'
import { Button } from '@pancakeswap/uikit'
import { KeyboardEvent, useEffect, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { shallow } from 'zustand/shallow'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { isValidUrl } from '@/utils/url'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'

export function RPCConnectionSettingField() {
  const { t } = useTranslation()
  const [isMobile, rpcs, rpcNodeUrl, setRpcUrlAct] = useAppStore((s) => [s.isMobile, s.rpcs, s.rpcNodeUrl, s.setRpcUrlAct], shallow)
  const isCurrentCustom = !rpcs.some((rpc) => rpc.url === rpcNodeUrl) && !!rpcNodeUrl
  const [customUrl, setCustomUrl] = useState(isCurrentCustom ? rpcNodeUrl || 'https://' : 'https://')
  const { isOpen: isCustom, onOpen: onCustom, onClose: offCustom } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const defaultRpc = rpcs.find((rpc) => rpc.url === rpcNodeUrl)

  const handleSwitchCustomRpc = useEvent(async () => {
    if (!isValidUrl(customUrl)) return
    onLoading()
    await setRpcUrlAct(customUrl)
    offLoading()
  })

  useEffect(() => {
    if (isCurrentCustom) {
      onCustom()
      setCustomUrl(rpcNodeUrl)
    }
  }, [isCurrentCustom])

  return (
    <SettingField
      fieldName={t('RPC Connection')}
      tooltip={t('Select preferred RPC endpoint')}
      renderToggleButton={
        isMobile ? (isOpen) => <SettingFieldToggleButton isOpen={isOpen} renderContent={defaultRpc ? defaultRpc.name : rpcNodeUrl} /> : null
      }
      renderWidgetContent={
        <>
          <Flex flexWrap="wrap" gap={4}>
            {rpcs.map((rpc) => (
              <Button
                key={rpc.name}
                variant={rpcNodeUrl === rpc.url && !isCustom ? 'primary' : 'tertiary'}
                scale="sm"
                onClick={() => {
                  offCustom()
                  if (rpcNodeUrl !== rpc.url) setRpcUrlAct(rpc.url)
                }}
              >
                <Flex gap={1.5}>{rpc.name}</Flex>
              </Button>
            ))}
            <Button
              key="Custom"
              variant={isCurrentCustom || isCustom ? 'primary' : 'tertiary'}
              scale="sm"
              onClick={() => {
                onCustom()
                handleSwitchCustomRpc()
              }}
            >
              <Flex gap={1.5}>{t('Custom')}</Flex>
            </Button>
          </Flex>
          <InputGroup mt={4}>
            <Input
              flexGrow={1}
              width="full"
              variant="filledDark"
              placeholder="https://"
              bg={colors.backgroundDark}
              rounded="full"
              py={1}
              px={3}
              isInvalid={isCustom && !isValidUrl(customUrl)}
              isDisabled={!isCustom || isLoading}
              value={!isCustom ? rpcNodeUrl : customUrl}
              onBlur={handleSwitchCustomRpc}
              onChange={({ currentTarget: { value } }) => {
                const customUrl = value.replace(/^(https?:\/\/)?(https?:\/\/)/, '$2')
                setCustomUrl(customUrl)
              }}
              onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                const { key } = event
                key === 'Enter' && handleSwitchCustomRpc()
              }}
            />
            {isLoading ? (
              <InputRightElement>
                <Spinner size="sm" />
              </InputRightElement>
            ) : null}
          </InputGroup>
        </>
      }
    />
  )
}
