import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text
} from '@chakra-ui/react'
import { ApiV3Token, PoolFetchType } from '@pancakeswap/solana-core-sdk'
import { useCallback, useState } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { FormattedPoolInfoItem } from '@/hooks/pool/type'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useFetchPoolByMint from '@/hooks/pool/useFetchPoolByMint'

import { colors } from '@/theme/cssVariables'
import { formatLocaleStr } from '@/utils/numberish/formatter'

import List from '../../../../components/List'
import TokenAvatarPair from '../../../../components/TokenAvatarPair'
import TokenSearchInput from '../../../../components/TokenSearchInput'

export interface PoolSelectDialogProps {
  onSelectValue: (pool: FormattedPoolInfoItem) => void
  isOpen: boolean
  onClose: () => void
  poolType?: PoolFetchType
}

export default function PoolSelectDialog(props: PoolSelectDialogProps) {
  const { t } = useTranslation()
  const { poolType = PoolFetchType.All, onSelectValue, isOpen, onClose } = props
  const [searchText, setSearchText] = useState('')
  const [searchTokens, setSearchTokens] = useState<ApiV3Token[]>([])

  const { formattedData: data, isLoading: isMintSearchLoading } = useFetchPoolByMint({
    mint1: searchTokens[0]?.address,
    mint2: searchTokens[1]?.address,
    type: poolType
  })

  const { formattedData: searchIdData, isLoading: isSearchIdLoading } = useFetchPoolById({
    idList: [searchText],
    type: poolType
  })

  const isLoading = isSearchIdLoading || isMintSearchLoading

  const list = searchIdData?.length ? searchIdData : data || []

  const handleClose = useCallback(() => {
    onClose()
    setSearchText('')
  }, [onClose])

  const handleClick = useCallback(
    (val: FormattedPoolInfoItem) => {
      onSelectValue(val)
      handleClose()
    },
    [onSelectValue, handleClose]
  )

  const renderPoolRowItem = useCallback((pool: FormattedPoolInfoItem) => <PoolRowItem pool={pool} onClick={handleClick} />, [handleClick])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="lg">{t('Search for a pair or paste AMM ID')}</ModalHeader>
        <ModalCloseButton top="25px" />
        <ModalBody mt="10px">
          <Flex mb="16px" borderRadius="20px" w="full" py={2}>
            <TokenSearchInput
              w="full"
              value={searchText}
              onChange={setSearchText}
              selectedListValue={searchTokens}
              onSelectedListChange={setSearchTokens}
            />
          </Flex>
          {isLoading ? (
            <Skeleton width="80%" height="20px" />
          ) : list.length ? (
            <Box>
              <Flex color={colors.textPrimary} justifyContent="space-between" mb="10px">
                <Heading size="sm">{t('Pool')}</Heading>
                <Heading size="sm">{t('input AmmId / TVL')}</Heading>
              </Flex>
              <List maxHeight="50vh" gap={4} items={list} getItemKey={(pool) => pool.id}>
                {renderPoolRowItem}
              </List>
            </Box>
          ) : (
            <EmptyTokeSearchResult />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function EmptyTokeSearchResult() {
  const { t } = useTranslation()
  return <Text>{t('Can’t find the pool you’re looking for? Try entering the token address or check the pool lists below.')}</Text>
}

export function PoolRowItem({ pool, onClick }: { pool: FormattedPoolInfoItem; onClick: (pool: FormattedPoolInfoItem) => void }) {
  return (
    <Flex justifyContent="space-between" alignItems="center" onClick={() => onClick?.(pool)} h="fit-content" cursor="pointer">
      <HStack spacing={3}>
        <TokenAvatarPair token1={pool.mintA} token2={pool.mintB} size="md" />
        <Text fontSize="xl" fontWeight="medium">
          {pool.poolName}
        </Text>
      </HStack>

      <Grid
        gridTemplate={`
          "ammId"
          "tvl"
        `}
        columnGap={[1, 2]}
        alignItems="center"
      >
        <GridItem gridArea="ammId">
          <Text color={colors.textSecondary} textAlign="right">
            {pool.id.slice(0, 4)}...{pool.id.slice(-4)}
          </Text>
        </GridItem>
        <GridItem gridArea="tvl">
          <Text color={colors.textTertiary} fontSize="xs" textAlign="right">
            TVL: {formatLocaleStr(pool.tvl, 2)}
          </Text>
        </GridItem>
      </Grid>
    </Flex>
  )
}
