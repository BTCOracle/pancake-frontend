import {
  Balance,
  Box,
  Card,
  CardHeader,
  ExpandableButton,
  Flex,
  Text,
  TokenPairImage as UITokenPairImage,
} from '@pancakeswap/uikit'
import { Pool } from '@pancakeswap/widgets-internal'
import { styled } from 'styled-components'

import { useTranslation } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { vaultPoolConfig } from 'config/constants/pools'
import { useIfoCredit } from 'state/pools/hooks'
import { VaultKey } from 'state/types'
import { useConfig } from 'views/Ifos/contexts/IfoContext'

const StyledCardMobile = styled(Card)`
  max-width: 400px;
  width: 100%;
`

const StyledTokenContent = styled(Flex)`
  ${Text} {
    line-height: 1.2;
    white-space: nowrap;
  }
`

interface IfoPoolVaultCardMobileProps {
  pool?: Pool.DeserializedPool<Token>
}

const IfoPoolVaultCardMobile: React.FC<React.PropsWithChildren<IfoPoolVaultCardMobileProps>> = ({ pool }) => {
  const { t } = useTranslation()
  const credit = useIfoCredit()
  const { isExpanded, setIsExpanded } = useConfig()
  const cakeAsNumberBalance = getBalanceNumber(credit)

  if (!pool) {
    return null
  }

  return (
    <StyledCardMobile isActive>
      <CardHeader p="16px">
        <Flex justifyContent="space-between" alignItems="center">
          <StyledTokenContent alignItems="center" flex={1}>
            <UITokenPairImage width={24} height={24} {...vaultPoolConfig[VaultKey.CakeVault].tokenImage} />
            <Box ml="8px" width="180px">
              <Text small bold>
                {vaultPoolConfig[VaultKey.CakeVault].name}
              </Text>
              <Text color="textSubtle" fontSize="12px">
                {vaultPoolConfig[VaultKey.CakeVault].description}
              </Text>
            </Box>
          </StyledTokenContent>
          <StyledTokenContent flexDirection="column" flex={1}>
            <Text color="textSubtle" fontSize="12px">
              {t('iCAKE')}
            </Text>
            <Balance small bold decimals={3} value={cakeAsNumberBalance} />
          </StyledTokenContent>
          <ExpandableButton expanded={isExpanded} onClick={() => setIsExpanded((prev) => !prev)} />
        </Flex>
      </CardHeader>
    </StyledCardMobile>
  )
}

export default IfoPoolVaultCardMobile
