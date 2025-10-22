import { Flex, FlexGap } from '@pancakeswap/uikit'
import { DefaultExplorerSettingField } from 'components/Settings/DefaultExplorerSettingField'
import { RPCConnectionSettingField } from 'components/Settings/RPCConnectionSettingField'

export const SolanaSettingsTab = () => {
  return (
    <Flex pb="24px" flexDirection="column" alignItems="center" justifyContent="center" minHeight="200px">
      <FlexGap flexDirection="column" gap="24px">
        <DefaultExplorerSettingField />
        <RPCConnectionSettingField />
      </FlexGap>
    </Flex>
  )
}
