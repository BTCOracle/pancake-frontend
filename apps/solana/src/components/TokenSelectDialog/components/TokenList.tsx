import { Box, Divider, Flex, SimpleGrid } from '@chakra-ui/react'
import { Button, Input, InputGroup, SearchIcon, Text } from '@pancakeswap/uikit'
import { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'
import Decimal from 'decimal.js'
import { ChangeEvent, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import AddressChip from '@/components/AddressChip'
import List, { ListPropController } from '@/components/List'
import TokenAvatar from '@/components/TokenAvatar'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import useTokenPrice, { TokenPrice } from '@/hooks/token/useTokenPrice'
import { useEvent } from '@/hooks/useEvent'
import AddTokenIcon from '@/icons/misc/AddTokenIcon'
import RemoveTokenIcon from '@/icons/misc/RemoveTokenIcon'
import { useTokenAccountStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { formatToRawLocaleStr } from '@/utils/numberish/formatter'
import { isValidPublicKey } from '@/utils/publicKey'
import { sortItems } from '@/utils/sortItems'
import { filterTokenFn } from '@/utils/token'
import PopularTokenCell from './PopularTokenCell'

const perPage = 30

const USDCMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const SOLMint = PublicKey.default.toString()
const USDTMint = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'

export interface TokenListHandles {
  resetSearch: () => void
}

export default forwardRef<
  TokenListHandles,
  {
    onOpenTokenList: () => void
    isDialogOpen: boolean
    onChooseToken: (token: TokenInfo) => void
    filterFn?: (token: TokenInfo) => boolean
  }
>(function TokenList({ onOpenTokenList, isDialogOpen: isOpen, onChooseToken, filterFn }, ref) {
  const { t } = useTranslation()
  const orgTokenList = useTokenStore((s) => s.displayTokenList)
  const orgTokenMap = useTokenStore((s) => s.tokenMap)
  const setExtraTokenListAct = useTokenStore((s) => s.setExtraTokenListAct)
  const unsetExtraTokenListAct = useTokenStore((s) => s.unsetExtraTokenListAct)
  const [getTokenBalanceUiAmount, tokenAccountMap, tokenAccounts] = useTokenAccountStore((s) => [
    s.getTokenBalanceUiAmount,
    s.tokenAccountMap,
    s.tokenAccounts
  ])
  const [tokenPrice, setTokenPrice] = useState<Record<string, TokenPrice>>({})

  const fetchPriceList = useMemo(() => tokenAccounts.filter((a) => !a.amount.isZero()).map((a) => a.mint.toBase58()), [tokenAccounts])
  const { data } = useTokenPrice({
    mintList: fetchPriceList,
    refreshInterval: 1000 * 60 * 10
  })

  useEffect(() => {
    if (fetchPriceList.some((m) => !data[m])) return
    setTokenPrice(data)
  }, [data, fetchPriceList])

  const tokenList = useMemo(() => (filterFn ? orgTokenList.filter(filterFn) : orgTokenList), [filterFn, orgTokenList])
  const [filteredList, setFilteredList] = useState<TokenInfo[]>(tokenList)
  const [displayList, setDisplayList] = useState<TokenInfo[]>([])
  const [search, setSearch] = useState('')
  const customTokenInfo = useRef<{ name?: string; symbol?: string }>({})
  const listControllerRef = useRef<ListPropController>()

  useEffect(() => {
    listControllerRef.current?.resetRenderCount()
  }, [filteredList.length])

  useEffect(() => {
    setDisplayList(tokenList.slice(0, perPage))
  }, [tokenList])

  useEffect(() => {
    const compareFn = (_a: number, _b: number, items: { itemA: TokenInfo; itemB: TokenInfo }) => {
      const accountA = tokenAccountMap.get(items.itemA.address)
      const accountB = tokenAccountMap.get(items.itemB.address)
      const amountA = new Decimal(accountA?.[0].amount.toString() || Number.MIN_VALUE).div(10 ** items.itemA.decimals)
      const amountB = new Decimal(accountB?.[0].amount.toString() || Number.MIN_VALUE).div(10 ** items.itemB.decimals)

      const usdA = amountA.mul(tokenPrice[items.itemA.address]?.value || 0)
      const usdB = amountB.mul(tokenPrice[items.itemB.address]?.value || 0)

      if (usdB.gt(usdA)) return 1
      if (usdB.eq(usdA)) {
        if (amountB.gt(amountA)) return 1
        if (amountB.eq(amountA)) return 0
      }
      return -1
    }
    const sortedTokenList = sortItems(tokenList, {
      sortRules: [
        { value: (i) => (i.address === SOLMint ? i.address : null) },
        { value: (i) => (i.tags?.includes('unknown') ? null : i.symbol.length), compareFn }
      ]
    })
    const filteredList_ = search ? filterTokenFn(sortedTokenList, { searchStr: search }) : sortedTokenList
    setDisplayList(filteredList_.slice(0, perPage))
    setFilteredList(filteredList_)
  }, [search, tokenList, tokenAccountMap, orgTokenMap, tokenPrice])

  const tempSetNewToken = orgTokenMap.get(search)
  const { tokenInfo: newToken } = useTokenInfo({
    mint:
      search && (!filteredList.length || (tempSetNewToken?.type === 'unknown' && !tempSetNewToken?.userAdded)) && isValidPublicKey(search)
        ? search
        : undefined
  })
  const isUnknownNewToken = newToken?.type === 'unknown'
  useEffect(() => {
    customTokenInfo.current = {}
    if (!newToken) return
    setExtraTokenListAct({ token: newToken, addToStorage: newToken.type === 'raydium' || newToken.type === 'jupiter' })
  }, [newToken, setExtraTokenListAct])

  const showMoreData = useEvent(() => {
    setDisplayList((list) => list.concat(filteredList.slice(list.length, list.length + perPage)))
  })

  useEffect(() => {
    setSearch('')
  }, [isOpen])

  const handleSearchChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value)
  })

  const getBalance = useCallback(
    (token: TokenInfo) => getTokenBalanceUiAmount({ mint: token.address, decimals: token.decimals }).text,
    [getTokenBalanceUiAmount]
  )

  const handleAddUnknownTokenClick = useCallback(
    (token: TokenInfo) => {
      setExtraTokenListAct({ token: { ...token, userAdded: true }, addToStorage: true, update: true })
    },
    [setExtraTokenListAct]
  )
  const handleRemoveUnknownTokenClick = useCallback(
    (token: TokenInfo) => {
      unsetExtraTokenListAct(token)
    },
    [unsetExtraTokenListAct]
  )

  const USDC = useMemo(() => orgTokenMap.get(USDCMint), [orgTokenMap])
  const SOL = useMemo(() => orgTokenMap.get(SOLMint), [orgTokenMap])
  const USDT = useMemo(() => orgTokenMap.get(USDTMint), [orgTokenMap])

  const [usdcDisabled, solDisabled, usdtDisabled] = filterFn
    ? [!USDC || !filterFn(USDC), !SOL || !filterFn(SOL), !USDT || !filterFn(USDT)]
    : [false, false, false]

  const renderTokenItem = useCallback(
    (token: TokenInfo) => (
      <TokenRowItem
        token={token}
        balance={() => getBalance(token)}
        onClick={(token_) => onChooseToken(token_)}
        onAddUnknownTokenClick={(token_) => handleAddUnknownTokenClick(token_)}
        onRemoveUnknownTokenClick={() => handleRemoveUnknownTokenClick(token)}
      />
    ),
    [getBalance, handleAddUnknownTokenClick, handleRemoveUnknownTokenClick, onChooseToken]
  )
  useImperativeHandle(ref, () => ({
    resetSearch: () => {
      setSearch('')
    }
  }))
  return (
    <Flex direction="column" height="100%">
      <InputGroup startIcon={<SearchIcon color="textSubtle" />}>
        <Input
          autoComplete="off"
          scale="lg"
          placeholder={t('Search by token or paste address') ?? undefined}
          value={search}
          onChange={handleSearchChange}
        />
      </InputGroup>

      <Box pb="8px" my="12px">
        <Text fontSize="14px" py="12px">
          {t('Popular tokens')}
        </Text>

        <SimpleGrid gridTemplateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={3}>
          <PopularTokenCell token={USDC} onClick={(token) => onChooseToken(token)} disabled={usdcDisabled} />
          <PopularTokenCell token={SOL} onClick={(token) => onChooseToken(token)} disabled={solDisabled} />
          <PopularTokenCell token={USDT} onClick={(token) => onChooseToken(token)} disabled={usdtDisabled} />
        </SimpleGrid>
      </Box>

      <Divider my="3px" color={colors.backgroundTransparent12} />

      <Flex direction="column" flexGrow={1} css={{ contain: 'size' }}>
        <Flex justifyContent="space-between" py="10px">
          <Text fontSize="14px">{t('Token')}</Text>
          <Text fontSize="14px">
            {t('Balance')}/{t('Address')}
          </Text>
        </Flex>
        {isUnknownNewToken ? (
          <Box padding={4} gap={4} flexDirection="column" display="flex">
            <Flex alignItems="center">
              <Text>Symbol:</Text>
              <InputGroup>
                <Input
                  p="8px 16px"
                  placeholder={t('input a symbol for this token') ?? undefined}
                  defaultValue={`${newToken?.symbol}`}
                  onChange={(e) => {
                    customTokenInfo.current.symbol = e.currentTarget.value
                  }}
                />
              </InputGroup>
            </Flex>
            <Flex alignItems="center">
              <Text>Name:</Text>
              <InputGroup>
                <Input
                  p="8px 16px"
                  placeholder={t('input a name for this token (optional)') ?? undefined}
                  defaultValue={newToken?.name}
                  onChange={(e) => {
                    customTokenInfo.current.name = e.currentTarget.value
                  }}
                />
              </InputGroup>
            </Flex>
            <Button
              width="full"
              onClick={() => {
                handleAddUnknownTokenClick({
                  ...newToken,
                  ...customTokenInfo.current
                })
                customTokenInfo.current = {}
              }}
            >
              {t('Add User Token')}
            </Button>
          </Box>
        ) : (
          <Box overflow="hidden" mx="-12px">
            <List height="100%" onLoadMore={showMoreData} preventResetOnChange items={displayList} getItemKey={(token) => token.address}>
              {renderTokenItem}
            </List>
          </Box>
        )}
      </Flex>
      {!isUnknownNewToken ? (
        <Box my="12px">
          <Text fontSize="14px" style={{ opacity: 0.5 }}>
            {t('Can’t find the token you’re looking for? Try entering the mint address or check token list settings below.')}
          </Text>
        </Box>
      ) : null}

      <Button
        style={{ boxShadow: `0px -2px 0px 0px rgba(0, 0, 0, 0.10) inset` }}
        variant="tertiary"
        width="full"
        onClick={() => onOpenTokenList()}
      >
        {t('View Token List')}
      </Button>
    </Flex>
  )
})

function TokenRowItem({
  token,
  balance,
  onClick,
  onAddUnknownTokenClick,
  onRemoveUnknownTokenClick
}: {
  token: TokenInfo
  balance: () => string
  onClick: (token: TokenInfo) => void
  onAddUnknownTokenClick: (token: TokenInfo) => void
  onRemoveUnknownTokenClick: (token: TokenInfo) => void
}) {
  const { t } = useTranslation()
  const isUnknown = !token.type || token.type === 'unknown' || token.tags?.includes('unknown')
  const isTrusted = isUnknown && !!useTokenStore.getState().tokenMap.get(token.address)?.userAdded

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      _hover={{
        bg: colors.backgroundDark50
      }}
      rounded="md"
      py="12px"
      px="12px"
      maxW="100%"
      overflow="hidden"
      onClick={() => onClick?.(token)}
    >
      <Flex w="full" justifyContent="space-between" _hover={{ '.addRemoveCtrlContent': { display: 'flex' } }}>
        <Flex w="0" flexGrow={1} minW="0">
          <TokenAvatar size="40px" token={token} mr="2" />
          <Box w="100%" minW="0" overflow="hidden">
            <Box display="flex" gap={2} alignItems="center">
              <Text bold>{token.symbol}</Text>
              {isUnknown ? (
                <Box
                  className="addRemoveCtrlContent"
                  display="none"
                  alignSelf="center"
                  alignItems="center"
                  cursor="pointer"
                  onClick={(ev) => {
                    ev.stopPropagation()
                    !isTrusted ? onAddUnknownTokenClick?.(token) : onRemoveUnknownTokenClick?.(token)
                  }}
                >
                  {!isTrusted ? <AddTokenIcon /> : <RemoveTokenIcon />}
                  <Text fontSize="sm" lineHeight="16px" pl={1} fontWeight="medium" color={colors.textSeptenary}>
                    {!isTrusted ? t('Add token') : t('Remove token')}
                  </Text>
                </Box>
              ) : null}
            </Box>
            <Text fontSize="12px" color="textSubtle">
              {token.name}
            </Text>
          </Box>
        </Flex>
        <Box flexShrink={0}>
          <Box color={colors.textSecondary} textAlign="right">
            <Text bold>{formatToRawLocaleStr(balance())}</Text>
            <AddressChip
              iconProps={{ width: '14px', height: '14px' }}
              textProps={{ lineHeight: 1.5 }}
              onClick={(ev) => ev.stopPropagation()}
              color={colors.textSubtle}
              canExternalLink
              fontSize="12px"
              address={token.address}
            />
          </Box>
        </Box>
      </Flex>
      {/* <Grid
        gridTemplate={`
          "avatar symbol" auto
          "avatar name  " auto / auto 1fr
        `}
        columnGap={[1, 2]}
        alignItems="center"
        cursor="pointer"
      >
        <GridItem gridArea="avatar">
          <TokenAvatar token={token} />
        </GridItem>
        <GridItem gridArea="symbol">
          <Text color={colors.textSecondary}>{token.symbol}</Text>
        </GridItem>
        <GridItem gridArea="name">
          <Text
            color={colors.textTertiary}
            maxWidth={'90%'} // handle token is too long
            overflow={'hidden'}
            whiteSpace={'nowrap'}
            textOverflow={'ellipsis'}
            fontSize="xs"
          >
            {token.name}
          </Text>
        </GridItem>
      </Grid>

      <Grid
        gridTemplate={`
          "balance" auto
          "address" auto / auto 
        `}
        columnGap={[2, 4]}
        alignItems="center"
      >
        <GridItem gridArea="balance">
          <Text color={colors.textSecondary} textAlign="right">
            {balance()}
          </Text>
        </GridItem>
        <GridItem gridArea="address">
          <AddressChip
            onClick={(ev) => ev.stopPropagation()}
            color={colors.textTertiary}
            canExternalLink
            fontSize="xs"
            address={token.address}
          />
        </GridItem>
      </Grid> */}
    </Flex>
  )
}
