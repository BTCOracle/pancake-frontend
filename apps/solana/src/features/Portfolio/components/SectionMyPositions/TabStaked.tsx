import { Flex, Text, Button, Skeleton } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import Decimal from 'decimal.js'
import { PublicKey } from '@solana/web3.js'
import { routeToPage } from '@/utils/routeTools'
import useFetchStakePools from '@/hooks/pool/useFetchStakePools'
import toApr from '@/utils/numberish/toApr'
import { colors } from '@/theme/cssVariables/colors'
import { panelCard } from '@/theme/cssBlocks'

import { FarmBalanceInfo } from '@/hooks/farm/type'
import { FarmPositionInfo } from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchFarmBalance from '@/hooks/farm/useFetchFarmBalance'
import StakingPositionRawItem from './components/Staked/StakingPositionRawItem'

export default function MyPositionTabStaked({
  allFarmBalances,
  farmLpBasedData,
  refreshTag
}: {
  allFarmBalances: FarmBalanceInfo[]
  farmLpBasedData: Map<string, FarmPositionInfo>
  refreshTag: number
}) {
  const { t } = useTranslation()
  const { activeStakePools, isLoading } = useFetchStakePools({ refreshTag })

  const pool = activeStakePools[0]
  const ataBalance = allFarmBalances.find((f) => f.id === pool?.id)

  const v1Vault = farmLpBasedData.get(pool?.lpMint.address || '')?.data.find((d) => d.version === 'V1' && !new Decimal(d.lpAmount).isZero())
  const v1Balance = useFetchFarmBalance({
    shouldFetch: !!(v1Vault && new Decimal(v1Vault.lpAmount).gt(0)),
    farmInfo: pool,
    ledgerKey: v1Vault ? new PublicKey(v1Vault.userVault) : undefined
  })

  const res = ataBalance?.hasDeposited || !v1Balance.hasDeposited ? ataBalance : v1Balance

  return (
    <Flex direction="column" gap={4}>
      {pool && res && res.hasDeposited ? (
        <StakingPositionRawItem
          key={`user-position-staked-pool-${pool.id}-row`}
          pool={pool}
          staked={{
            token: pool.lpMint,
            amount: res.deposited,
            pendingReward: res.pendingRewards[0] || '0',
            v1Vault: v1Balance.hasDeposited ? v1Balance.vault : undefined
          }}
          onConfirmed={v1Balance.hasDeposited ? v1Balance.mutate : undefined}
          apr={toApr({ val: pool.apr || 0 })}
        />
      ) : (
        <Flex
          {...panelCard}
          alignItems="center"
          justifyContent="center"
          minH="200px"
          flexDir="column"
          py={5}
          px={8}
          bg={colors.backgroundLight}
          gap={6}
          borderRadius="xl"
        >
          {isLoading ? (
            <Skeleton height="100px" w="full" borderRadius="xl" />
          ) : (
            <>
              <Text variant="title" fontSize="sm">
                {t('You don’t have any staked RAY.')}
              </Text>
              <Button onClick={() => routeToPage('staking')}>{t('Go to Staking')}</Button>
            </>
          )}
        </Flex>
      )}
    </Flex>
  )
}
