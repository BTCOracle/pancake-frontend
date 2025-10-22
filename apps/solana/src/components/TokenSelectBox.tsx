import { Flex, HStack, Spacer, StyleProps, Text, useDisclosure } from '@chakra-ui/react'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { ReactNode, useCallback } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import TokenAvatar from './TokenAvatar'
import TokenSelectDialog from './TokenSelectDialog'

interface Props {
  /** for flex box */
  sx?: StyleProps
  /** top-left label  */
  label?: ReactNode
  /** only showed when token is not select */
  placeholder?: ReactNode

  token?: TokenInfo
  name?: string
  onSelectToken: (token: TokenInfo | undefined, name?: string) => void
  filterTokenFn?: (token: TokenInfo) => boolean
}

/**
 * with toke input selector
 */
export default function TokenSelectBox({ token, label, placeholder: _placeholder, sx = {}, name, onSelectToken, filterTokenFn }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const placeholder = _placeholder ?? (
    <Text as="span" color={colors.textTertiary}>
      {t('Select')}
    </Text>
  )
  const handleSelectValue = useCallback(
    (token: TokenInfo) => {
      onSelectToken(token, name)
      onClose()
    },
    [onSelectToken, name]
  )
  return (
    <Flex flexDirection="column" justifyContent="center" gap="2" py={2} px={4} borderRadius="12px" bg={colors.backgroundLight} sx={sx}>
      <Text fontSize="xs" color={colors.textTertiary}>
        {label}
      </Text>
      <HStack onClick={onOpen} cursor="pointer" gap={2}>
        {token ? <TokenAvatar token={token} /> : null}
        <Text>{token?.symbol || placeholder}</Text>
        <Spacer />
        <ChevronDownIcon width={16} height={16} color={colors.textTertiary} />
      </HStack>
      <TokenSelectDialog isOpen={isOpen} onClose={onClose} onSelectValue={handleSelectValue} filterFn={filterTokenFn} />
    </Flex>
  )
}
