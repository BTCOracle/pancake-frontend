import { ArrowDropDownIcon } from '@pancakeswap/uikit'
import { Box, Flex, HStack, SystemStyleObject, Tag, Text, TextProps, useDisclosure } from '@chakra-ui/react'
import { ApiClmmConfigInfo, ApiV3Token, PoolFetchType, TokenInfo, solToWSol } from '@pancakeswap/solana-core-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'react-feather'
import { useTranslation } from '@pancakeswap/localization'
import uniqWith from 'lodash/uniqWith'
import PanelCard from '@/components/PanelCard'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenSelectDialog from '@/components/TokenSelectDialog'
import useFetchPoolByMint from '@/hooks/pool/useFetchPoolByMint'
import EditIcon from '@/icons/misc/EditIcon'
import { useClmmStore } from '@/store/useClmmStore'
import { colors } from '@/theme/cssVariables/colors'
import ConnectedButton from '@/components/ConnectedButton'
import { Select } from '@/components/Select'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { percentFormatter } from '@/utils/numberish/formatter'
import { inputCard } from '@/theme/cssBlocks'

type Side = 'token1' | 'token2'

interface Props {
  completed: boolean
  isLoading: boolean
  show: boolean
  initState?: {
    token1?: ApiV3Token
    token2?: ApiV3Token
    config?: ApiClmmConfigInfo
  }
  onConfirm: (props: { token1: ApiV3Token; token2: ApiV3Token; ammConfig: ApiClmmConfigInfo }) => void
  onEdit: (step: number) => void
}

const SelectBoxSx: SystemStyleObject = {
  minW: '140px',
  cursor: 'pointer',
  py: '2',
  px: '4'
}

const titleProps: TextProps = {
  variant: 'title'
}

export default function SelectPoolTokenAndFee({ completed, initState, show, isLoading, onConfirm, onEdit }: Props) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const clmmFeeConfigs = useClmmStore((s) => s.clmmFeeConfigs)
  const clmmFeeOptions = uniqWith(Object.values(clmmFeeConfigs), (a, b) => a.tradeFeeRate === b.tradeFeeRate).toSorted(
    (a, b) => a.tradeFeeRate - b.tradeFeeRate
  )

  const [tokens, setTokens] = useState<{
    token1?: ApiV3Token
    token2?: ApiV3Token
  }>({ token1: initState?.token1, token2: initState?.token2 })
  const { token1, token2 } = tokens
  const [currentConfig, setCurrentConfig] = useState<ApiClmmConfigInfo | undefined>(initState?.config)
  const poolKey = `${token1?.address}-${token2?.address}`
  const selectRef = useRef<Side>('token1')
  const isSolWSolPair = useMemo(() => {
    return (
      (token1?.address === '11111111111111111111111111111111' && token2?.address === 'So11111111111111111111111111111111111111112') ||
      (token1?.address === 'So11111111111111111111111111111111111111112' && token2?.address === '11111111111111111111111111111111')
    )
  }, [token1, token2])

  useTokenPrice({
    mintList: token1 && token2 ? [token1.address, token2.address] : [],
    timeout: 100
  })

  const { data, isLoading: isExistingLoading } = useFetchPoolByMint({
    shouldFetch: !!token1 && !!token2,
    mint1: token1 ? solToWSol(token1.address).toString() : '',
    mint2: token2 ? solToWSol(token2.address || '').toString() : '',
    type: PoolFetchType.Concentrated
  })

  const existingPools: Map<string, string> = useMemo(
    () =>
      (data || [])
        .filter((pool) => {
          const [token1Mint, token2Mint] = [
            token1 ? solToWSol(token1.address).toString() : '',
            token2 ? solToWSol(token2.address || '').toString() : ''
          ]
          return (
            (pool.mintA?.address === token1Mint && pool.mintB?.address === token2Mint) ||
            (pool.mintA?.address === token2Mint && pool.mintB?.address === token1Mint)
          )
        })
        .reduce((acc, cur) => acc.set(cur.id, cur.config.id), new Map()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token1?.address, token2?.address, data]
  )

  const isSelectedExisted = !!currentConfig && new Set(existingPools.values()).has(currentConfig.id)
  useEffect(() => () => setCurrentConfig(undefined), [poolKey, isSelectedExisted])

  useEffect(() => {
    if (isExistingLoading) return
    const defaultConfig = Object.values(clmmFeeConfigs || {}).find((c) => c.tradeFeeRate === 2500)
    if (!new Set(existingPools.values()).has(defaultConfig?.id || '')) {
      if (defaultConfig) setCurrentConfig((preConfig) => preConfig || defaultConfig)
    }
  }, [poolKey, existingPools, clmmFeeConfigs, isExistingLoading])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      selectRef.current = e.currentTarget.dataset.side as Side
      onOpen()
    },
    [onOpen]
  )

  const handleSelect = useCallback(
    (val: ApiV3Token) => {
      onClose()
      setTokens((preVal) => {
        const anotherSide = selectRef.current === 'token1' ? 'token2' : 'token1'
        const isDuplicated = val.address === preVal[anotherSide]?.address
        return { [anotherSide]: isDuplicated ? undefined : preVal[anotherSide], [selectRef.current]: val }
      })
    },
    [onClose]
  )

  const filterFn = useCallback((t_: TokenInfo) => t_.address !== tokens[selectRef.current]?.address, [tokens])

  const handleConfirm = () => {
    onConfirm({
      token1: tokens.token1!,
      token2: tokens.token2!,
      ammConfig: currentConfig!
    })
  }

  const renderItem = useCallback(
    (v?: ApiClmmConfigInfo) => {
      if (v) {
        const existed = new Set(existingPools.values()).has(v.id)
        const selected = currentConfig?.id === v.id
        return (
          <HStack
            color={selected ? colors.backgroundAlt : colors.textPrimary}
            opacity={existed ? 0.5 : 1}
            cursor={existed ? 'not-allowed' : 'pointer'}
            justifyContent="space-between"
            bg={selected ? colors.textSubtle : 'transparent'}
            py={2.5}
            px={4}
            fontSize="sm"
          >
            <Text>{percentFormatter.format(v.tradeFeeRate / 1000000)}</Text>
          </HStack>
        )
      }
      return null
    },
    [currentConfig?.id, existingPools]
  )

  let error = tokens.token1 ? (tokens.token2 ? undefined : t('Quote token')) : t('Base token')
  error = error || (currentConfig ? undefined : t('Fee Tier'))

  if (!show) return null
  if (completed) {
    return (
      <PanelCard px={[3, 6]} py="3">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex gap="2" alignItems="center">
            <TokenAvatarPair {...tokens} />
            <Text fontSize="lg" fontWeight="600" color={colors.textPrimary}>
              {tokens.token1?.symbol} / {tokens.token2?.symbol}
            </Text>
            <Tag size="sm" variant="rounded" bg={colors.primary10} color={colors.primary60} border={`1px solid ${colors.primary20}`}>
              {t('Fee.rate')} {percentFormatter.format((currentConfig?.tradeFeeRate || 0) / 1000000)}
            </Tag>
          </Flex>
          <EditIcon cursor="pointer" onClick={() => onEdit(0)} />
        </Flex>
      </PanelCard>
    )
  }
  return (
    <PanelCard p={[3, 6]}>
      <Text {...titleProps} mb="4">
        {t('Tokens')}
      </Text>
      <Flex gap="2" alignItems="center" mb="6">
        <Box {...inputCard} data-side="token1" flex="1" onClick={handleClick} sx={SelectBoxSx}>
          <Text variant="label" color={colors.textSubtle} mb="2">
            {t('Base token')}
          </Text>
          <Flex gap="2" alignItems="center" justifyContent="space-between">
            {tokens.token1 ? (
              <Flex gap="2" alignItems="center">
                <TokenAvatar size="sm" token={tokens.token1} />
                <Text {...titleProps} color={colors.textPrimary}>
                  {tokens.token1.symbol}
                </Text>
              </Flex>
            ) : (
              <Text {...titleProps} color={colors.textSubtle} fontSize="lg" opacity="0.5">
                {t('Select')}
              </Text>
            )}
            <ChevronDown color={colors.textSecondary} opacity="0.5" />
          </Flex>
        </Box>
        <Box {...inputCard} data-side="token2" flex="1" onClick={handleClick} sx={SelectBoxSx}>
          <Text variant="label" color={colors.textSubtle} mb="2">
            {t('Quote token')}
          </Text>
          <Flex gap="2" alignItems="center" justifyContent="space-between">
            {tokens.token2 ? (
              <Flex gap="2" alignItems="center">
                <TokenAvatar size="sm" token={tokens.token2} />
                <Text {...titleProps} color={colors.textPrimary}>
                  {tokens.token2.symbol}
                </Text>
              </Flex>
            ) : (
              <Text {...titleProps} color={colors.textSubtle} fontSize="lg" opacity="0.5">
                {t('Select')}
              </Text>
            )}
            <ChevronDown color={colors.textSubtle} opacity="0.5" />
          </Flex>
        </Box>
      </Flex>
      <TokenSelectDialog onClose={onClose} isOpen={isOpen} filterFn={filterFn} onSelectValue={handleSelect} />

      <Text {...titleProps} mb="4">
        {t('Fee Tier')}
      </Text>
      <Flex w="full" gap="2">
        <Select
          variant="filledDark"
          items={isSolWSolPair ? [] : clmmFeeOptions}
          value={isSolWSolPair ? undefined : currentConfig}
          renderItem={renderItem}
          renderTriggerItem={(v) =>
            v ? (
              <Text color={colors.textPrimary} fontSize="sm">
                {percentFormatter.format(v.tradeFeeRate / 1000000)}
              </Text>
            ) : null
          }
          onChange={(val) => {
            const existed = new Set(existingPools.values()).has(val.id)
            const selected = currentConfig?.id === val.id
            !existed && !selected && setCurrentConfig(val)
          }}
          sx={{
            w: 'full',
            height: '42px'
          }}
          popoverContentSx={{
            border: `1px solid ${colors.inputBorder}`,
            py: 0
          }}
          popoverItemSx={{
            p: 0,
            lineHeight: '18px',
            _hover: {
              bg: colors.modalContainerBg
            }
          }}
          icons={{
            open: (
              <ArrowDropDownIcon
                color={colors.textSubtle}
                style={{
                  transform: 'rotate(180deg)',
                  transition: 'transform 0.1s ease'
                }}
              />
            ),
            close: <ArrowDropDownIcon color={colors.textSubtle} />
          }}
        />
      </Flex>
      <ConnectedButton
        mt="2rem"
        disabled={!!error || !currentConfig || isSolWSolPair}
        isLoading={isLoading || isExistingLoading}
        onClick={handleConfirm}
      >
        {error ? `${t('Select')} ${t(error)}` : t('Continue')}
      </ConnectedButton>
    </PanelCard>
  )
}
