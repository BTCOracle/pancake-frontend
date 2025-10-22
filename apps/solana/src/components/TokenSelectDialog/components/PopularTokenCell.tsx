import styled from '@emotion/styled'
import { FlexGap, Text } from '@pancakeswap/uikit'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { colors } from '@/theme/cssVariables'
import TokenAvatar from '../../TokenAvatar'

export interface TokenSelectDialogProps {
  onSelectValue: (token: TokenInfo) => void
  isOpen: boolean
  filterFn?: (token: TokenInfo) => boolean
  onClose: () => void
}

const StyledCell = styled(FlexGap, {
  shouldForwardProp: (prop) => !['disabled'].includes(prop)
})<{ disabled?: boolean }>`
  background-color: ${colors.inputBg};
  padding: 5px 8px;
  border-radius: 8px;
  cursor: pointer;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
  transition: background-color 0.15s;

  &:hover {
    background-color: ${(props) => !props.disabled && colors.background};
  }
`

export default function PopularTokenCell({
  disabled,
  token,
  onClick
}: {
  disabled?: boolean
  token: TokenInfo | undefined
  onClick?: (token: TokenInfo) => void
}) {
  return (
    <StyledCell gap="8px" onClick={disabled ? undefined : () => token && onClick?.(token)}>
      {token && (
        <>
          <TokenAvatar token={token} size="sm" />
          <Text fontSize="14px">{token.symbol}</Text>
        </>
      )}
    </StyledCell>
  )
}
