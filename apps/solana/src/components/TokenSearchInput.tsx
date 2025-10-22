import { useState, useEffect, useMemo, useCallback, MouseEvent, KeyboardEvent, useRef, useDeferredValue, forwardRef } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, Flex, Text, Input, Popover, PopoverAnchor, PopoverContent, PopoverBody, HStack } from '@chakra-ui/react'
import { ApiV3Token, solToWSol } from '@pancakeswap/solana-core-sdk'
import { shallow } from 'zustand/shallow'
import AddressChip from '@/components/AddressChip'
import Close from '@/icons/misc/Close'
import { debounce } from '@/utils/functionMethods'
import useTokenInfo from '@/hooks/token/useTokenInfo'
import { useTokenStore } from '@/store/useTokenStore'
import { colors } from '@/theme/cssVariables/colors'
import SearchIcon from '@/icons/misc/SearchIcon'
import useResizeObserver from '@/hooks/useResizeObserver'
import { filterTokenFn } from '@/utils/token'
import { isValidPublicKey } from '@/utils/publicKey'
import { inputCard } from '@/theme/cssBlocks'
import TokenAvatar from './TokenAvatar'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  selectedListValue?: ApiV3Token[]
  onSelectedListChange?: (value: ApiV3Token[]) => void
  hideAutoComplete?: boolean
} & Omit<BoxProps, 'value' | 'onChange'>

export default forwardRef(function TokenSearchInput(
  { value, onChange, hideAutoComplete, selectedListValue, onSelectedListChange, ...boxProps }: SearchBarProps,
  searchRef
) {
  const { t } = useTranslation()
  const [displayTokenList, tokenMap, setExtraTokenListAct, setDisplayTokenListAct] = useTokenStore(
    (s) => [s.displayTokenList, s.tokenMap, s.setExtraTokenListAct, s.setDisplayTokenListAct],
    shallow
  )

  const ref = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState(value)
  const [open, setOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<ApiV3Token[]>(selectedListValue || [])

  const { tokenInfo: newToken } = useTokenInfo({
    mint: value && !tokenMap.get(value) && isValidPublicKey(value) ? value : undefined
  })

  const debounceUpdate = useCallback(
    debounce((val: string) => {
      !hideAutoComplete && val.length && setOpen(true)
      setSearchValue(val)
    }, 150),
    [hideAutoComplete]
  )

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setOpen(false)
    }, 100)
  }, [])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const token = tokenMap.get(e.currentTarget.dataset.mint!)
      if (token) {
        onSelectedListChange ? onSelectedListChange([...selectedList.concat([token])]) : setSelectedList([...selectedList.concat([token])])
        onChange('')
      }
      handleClose()
    },
    [tokenMap, selectedList, handleClose, onChange, onSelectedListChange]
  )

  const handleRemove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const idx = Number(e.currentTarget.dataset.idx)
      selectedList.splice(idx, 1)
      onSelectedListChange ? onSelectedListChange([...selectedList]) : setSelectedList([...selectedList])
    },
    [tokenMap, selectedList, onSelectedListChange, handleClose]
  )

  const handleCleanInput = useCallback(() => {
    onChange('')
    onSelectedListChange ? onSelectedListChange([]) : setSelectedList([])
  }, [onSelectedListChange])

  useEffect(() => {
    if (!newToken) return
    setExtraTokenListAct({ token: newToken })
    setDisplayTokenListAct()
  }, [newToken, setExtraTokenListAct, setDisplayTokenListAct])

  useEffect(() => {
    debounceUpdate(value)
  }, [value])

  useEffect(() => {
    setSelectedList(selectedListValue || [])
  }, [selectedListValue])

  useEffect(() => {
    if (hideAutoComplete) setOpen(false)
  }, [hideAutoComplete])

  useEffect(() => {
    if (!selectedList.length || !value) return
    if (selectedList.some((t_) => t_.address === value)) onChange('')
  }, [value, selectedList, onChange])

  useEffect(() => {
    if (typeof searchRef === 'function') {
      searchRef(anchorRef.current)
    } else if (searchRef) {
      // eslint-disable-next-line no-param-reassign
      searchRef.current = anchorRef.current
    }
  }, [searchRef])

  const _filteredList = useMemo(() => {
    if (!searchValue) return []
    const selectedSet = new Set(selectedList.map((token) => token.address))
    return filterTokenFn(displayTokenList, {
      searchStr: searchValue,
      skipFn: (data) => selectedSet.has(data.address)
    })
  }, [searchValue, displayTokenList, selectedList])
  const filteredList = useDeferredValue(_filteredList)

  const [triggerWidth, setTriggerWidth] = useState(0)
  const anchorRef = useRef<HTMLDivElement>(null)
  useResizeObserver(anchorRef, ({ el }) => {
    setTriggerWidth(el.clientWidth)
  })

  // use keyboard arrow keys set active token
  const getEnabledActiveIndex = (index: number, offset = 1): number => {
    const len = filteredList.length
    for (let i = 0; i < len; i += 1) {
      const current = (index + i * offset + len) % len
      const { address } = filteredList[current] || {}
      if (address) {
        return current
      }
    }
    return -1
  }

  const [activeIndex, setActiveIndex] = useState(() => getEnabledActiveIndex(0))

  // Auto active first item when list length or searchValue changed
  useEffect(() => {
    setActiveIndex(getEnabledActiveIndex(0))
  }, [filteredList.length, searchValue])
  const listRef = useRef<HTMLDivElement>(null)
  const scrollIntoView = (args: number) => {
    const itemElement = listRef?.current?.children[args] as HTMLElement | undefined
    itemElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  useEffect(() => {
    scrollIntoView(0)
  }, [searchValue])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const { key } = event
      switch (key) {
        // >>> Arrow keys
        case 'ArrowUp':
        case 'ArrowDown': {
          event.preventDefault()
          let offset = 0
          if (key === 'ArrowUp') {
            offset = -1
          } else if (key === 'ArrowDown') {
            offset = 1
          }
          if (offset !== 0) {
            const nextActiveIndex = getEnabledActiveIndex(activeIndex + offset, offset)
            scrollIntoView(nextActiveIndex)
            setActiveIndex(nextActiveIndex)
          }
          break
        }
        // >>> Select
        case 'Enter': {
          const item = filteredList[activeIndex]
          if (item) {
            const token = tokenMap.get(item.address!)
            if (selectedList.length === 1) {
              event.currentTarget.blur()
            }
            if (token) {
              onSelectedListChange
                ? onSelectedListChange([...selectedList.concat([token])])
                : setSelectedList([...selectedList.concat([token])])
              onChange('')
            }
          } else {
            onChange('')
          }
          if (open) {
            event.preventDefault()
          }
          break
        }
        // >>> Close
        case 'Escape': {
          handleClose()
          event.currentTarget.blur()
          if (open) {
            event.stopPropagation()
          }
          break
        }
        default:
          break
      }
    },
    [filteredList, tokenMap, open, scrollIntoView, onSelectedListChange]
  )

  return (
    <Box {...boxProps}>
      <Popover isOpen={open} autoFocus={false} closeOnBlur={false} placement="bottom-start">
        <PopoverAnchor>
          <HStack
            ref={anchorRef}
            {...inputCard}
            pl="2"
            pr="3"
            placeItems="center"
            borderRadius="100px"
            h={['34px', 10]}
            borderTop="1px solid"
            borderLeft="1px solid"
            borderRight="1px solid"
            borderBottom="2px solid"
            borderColor={colors.inputSecondary}
          >
            {selectedList.length > 0 ? (
              <HStack flexShrink={0}>
                {selectedList.map((token, idx) => (
                  <TokenTag key={token.address} handleRemove={handleRemove} token={token} idx={idx} />
                ))}
              </HStack>
            ) : (
              <Box>
                <SearchIcon />
              </Box>
            )}
            {/* {selectedList.length ? selectedList.map((token) => <Tag key={token.address}>{token.symbol}</Tag>) : null} */}
            <Input
              flexGrow={1}
              ref={ref}
              onFocus={() => setOpen(true)}
              onBlur={handleClose}
              value={value}
              onChange={(e) => onChange(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedList.length ? '' : t('Search')!}
              h={['34px', 10]}
              borderRadius="100px"
              disabled={selectedList.length === 2}
              px={1}
              sx={{
                w: 'full',
                bg: 'transparent',
                caretColor: colors.textSecondary,
                _hover: {
                  bg: 'transparent'
                },
                _focus: {
                  borderColor: 'transparent',
                  bg: 'transparent'
                },
                _focusVisible: {
                  borderColor: 'transparent',
                  boxShadow: 'none'
                }
              }}
            />
            <Box flexShrink={0}>
              <Close
                width="10"
                height="10"
                color={colors.textSecondary}
                cursor="pointer"
                onClick={handleCleanInput}
                opacity={selectedList.length ? 1 : 0}
              />
            </Box>
          </HStack>
        </PopoverAnchor>

        <PopoverContent border={`1px solid ${colors.cardBorder01}`} minW={['none', '380px']} maxW="100%">
          <PopoverBody ref={listRef} py="2" px="4" maxH="400px" overflowY="auto" width={`${triggerWidth}px`}>
            {filteredList.length ? (
              filteredList.map((token, idx) => (
                <Flex
                  key={token.address}
                  data-mint={token.address}
                  onClick={handleClick}
                  onMouseMove={() => {
                    if (activeIndex === idx) {
                      return
                    }
                    setActiveIndex(idx)
                  }}
                  p="2"
                  bg={activeIndex === idx ? colors.background : 'transparent'}
                  cursor="pointer"
                  borderRadius="16px"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="2"
                  mb={idx !== filteredList.length - 1 ? '3' : '0'}
                >
                  <Flex alignItems="center" gap="2" overflow="hidden">
                    <TokenAvatar size="lg" mt="0.5" token={token} />
                    <Flex alignItems="center" gap="2" flexWrap="nowrap">
                      <Text variant="title" color={colors.textPrimary} fontSize="md" whiteSpace="nowrap">
                        {token.symbol}
                      </Text>
                      <Text variant="label" fontSize="md" whiteSpace="nowrap">
                        {token.name}
                      </Text>
                    </Flex>
                  </Flex>
                  <AddressChip
                    textProps={{ px: '2', borderRadius: '4px', color: colors.textSubtle }}
                    address={solToWSol(token.address).toString()}
                    canCopy={false}
                    canExternalLink
                    iconProps={{ color: colors.textSubtle }}
                  />
                </Flex>
              ))
            ) : (
              <Text variant="label" fontSize="sm">
                {searchValue ? t('No matches.') : t('Search for token or paste mint address.')}
              </Text>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  )
})

function TokenTag(props: { token: ApiV3Token; handleRemove: (e: MouseEvent<HTMLDivElement>) => void; idx: number }) {
  return (
    <HStack rounded="full" gap={1} alignItems="center" bg={colors.textSubtle}>
      <TokenAvatar flex="none" size="smi" token={props.token} />
      <Text flex="none" lineHeight={1} color={colors.backgroundAlt} my="5px">
        {props.token.symbol}
      </Text>
      <Box flex="none" onClick={props.handleRemove} ml={0.5} mr={1} data-idx={props.idx} cursor="pointer">
        <Close width={10} height={10} color={colors.backgroundAlt} />
      </Box>
    </HStack>
  )
}
