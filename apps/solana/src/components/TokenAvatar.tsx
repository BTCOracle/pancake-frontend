import { useEffect, useMemo, useState } from 'react'
import { AvatarProps, Box, forwardRef } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { DefaultTokenIcon } from '@pancakeswap/uikit'

import useTokenInfo from '@/hooks/token/useTokenInfo'
import { colors } from '@/theme/cssVariables'

// eslint-disable-next-line @typescript-eslint/ban-types
export type TokenAvatarSize = 'xs' | 'sm' | 'smi' | 'md' | 'lg' | '2xl' | (string & {})

type RawTokenAvatarProps = {
  /** pase token to contain all info */
  token?: ApiV3Token | Pick<ApiV3Token, 'address' | 'symbol' | 'decimals' | 'logoURI'>
  tokenMint?: string

  /** xs: 16px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: TokenAvatarSize | TokenAvatarSize[]
  bgBlur?: boolean

  /** when token is not specified */
  icon?: string
  /** will set it's alert */
  name?: string

  haveHTMLTitle?: boolean
}

/** default size is 'sm' */
export type TokenAvatarProps = RawTokenAvatarProps & Omit<AvatarProps, keyof RawTokenAvatarProps>
const sizeMap = {
  xs: '16px',
  sm: '20px',
  smi: '28px',
  md: '32px',
  lg: '40px',
  '2xl': '80px'
}
// @ts-expect-error enum
const parseSize = (size: TokenAvatarSize) => sizeMap[size]

export default forwardRef(function TokenAvatar(
  { token: originalToken, tokenMint, icon, size = 'md', name, bgBlur, haveHTMLTitle, ...restProps }: TokenAvatarProps,
  ref
) {
  const [loadFailed, setLoadFailed] = useState(false)

  const boxSize = Array.isArray(size) ? size.map((s) => parseSize(s) ?? s) : parseSize(size) ?? size
  const { tokenInfo } = useTokenInfo({
    mint: tokenMint
  })

  const token = originalToken || tokenInfo

  const iconSrc = useMemo(() => icon ?? (token ? token.logoURI : undefined), [icon, token])

  useEffect(() => {
    setLoadFailed(false)
  }, [iconSrc])

  return (
    // panel bg board
    <Box
      ref={ref}
      bg={colors.tokenAvatarBg}
      minWidth={boxSize}
      minHeight={boxSize}
      maxWidth={boxSize}
      maxHeight={boxSize}
      borderRadius="50%"
      fontSize={boxSize} // for use 'em' unit
      backdropFilter={bgBlur ? 'blur(2px)' : undefined}
      {...restProps}
    >
      {/* token icon container */}
      <Box borderRadius="50%" aspectRatio="1" overflow="hidden">
        {iconSrc && !loadFailed ? (
          <img
            src={iconSrc}
            onError={() => {
              setLoadFailed(true)
            }}
            alt={name || token?.address}
            title={haveHTMLTitle && (name || token) ? `${name || token?.symbol || token?.address}` : undefined}
            width="100%"
            height="100%"
          />
        ) : (
          <DefaultTokenIcon color="disabled" width="100%" height="100%" />
        )}
      </Box>
    </Box>
  )
})
