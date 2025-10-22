import { Flex, Button, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { CSSProperties } from 'react'

interface SolanaImportRowProps {
  token: SPLToken
  style?: CSSProperties
  onCurrencySelect?: (currency: SPLToken) => void
  showImportView: () => void
  setImportToken: (token: SPLToken) => void
}

export default function SolanaImportRow({
  token,
  style,
  onCurrencySelect,
  showImportView,
  setImportToken,
}: SolanaImportRowProps) {
  return (
    <Flex style={style} alignItems="center" justifyContent="space-between" padding="4px 20px">
      <Flex
        flex="1"
        alignItems="center"
        minWidth={0}
        onClick={() => onCurrencySelect?.(token)}
        style={{ cursor: 'pointer' }}
      >
        <CurrencyLogo currency={token} size="24px" />
        <Flex flexDirection="column" ml="12px" overflow="hidden">
          <Text bold ellipsis>
            {token.symbol}
          </Text>
          <Text fontSize="12px" color="textSubtle" ellipsis>
            {token.name}
          </Text>
        </Flex>
      </Flex>
      <Button
        scale="sm"
        onClick={(e) => {
          e.stopPropagation()
          setImportToken(token)
          showImportView()
        }}
      >
        Import
      </Button>
    </Flex>
  )
}
