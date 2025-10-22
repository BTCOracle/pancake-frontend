import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, Card, CardBody, FlexGap, Grid, Text } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import React, { useCallback, useEffect, useState } from 'react'
import {
  InfinityBinPoolInfo,
  InfinityCLPoolInfo,
  PoolInfo,
  SolanaV3PoolInfo,
  StablePoolInfo,
  V2PoolInfo,
} from 'state/farmsV4/state/type'
import { useChainIdByQuery } from 'state/info/hooks'
import { getRewardProvider } from 'views/universalFarms/components/FarmStatusDisplay/hooks'
import { useCheckShouldSwitchNetwork } from 'views/universalFarms/hooks'

import { useAtom } from 'jotai'
import { positionEarningAmountAtom } from 'views/universalFarms/hooks/usePositionEarningAmount'
import { isSolana, NonEVMChainId } from '@pancakeswap/chains'

import { useAccount } from 'wagmi'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { MyPositionsProvider } from './MyPositionsContext'
import {
  InfinityBinPositionsTable,
  InfinityCLPositionsTable,
  V2OrSSPositionsTable,
  V3PositionsTable,
} from './ProtocolPositionsTables'
import { SolanaV3PositionsTable } from './ProtocolPositionsTables/SolanaV3PositionsTable'

export const MyPositions: React.FC<{ poolInfo: PoolInfo }> = ({ poolInfo }) => {
  return (
    <MyPositionsProvider>
      <MyPositionsInner poolInfo={poolInfo} />
    </MyPositionsProvider>
  )
}

const MyPositionsInner: React.FC<{ poolInfo: PoolInfo }> = ({ poolInfo }) => {
  const { t } = useTranslation()
  const { solanaAccount, account } = useAccountActiveChain()
  const chainId = useChainIdByQuery()
  const provider = getRewardProvider(poolInfo.chainId, poolInfo.lpAddress)
  const hasPoolReward = !!provider

  const { switchNetworkIfNecessary } = useCheckShouldSwitchNetwork()

  const [loading, setLoading] = useState(false)

  const handleHarvestAll = useCallback(async () => {
    if (loading) return
    const shouldSwitch = await switchNetworkIfNecessary(chainId)
    if (shouldSwitch) {
      return
    }
    try {
      setLoading(true)
      // Protocol-specific components handle their own harvest logic
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }, [loading, setLoading, chainId, switchNetworkIfNecessary])

  const [, setPositionEarningAmount] = useAtom(positionEarningAmountAtom)
  useEffect(() => {
    // clear position earning data when account update
    setPositionEarningAmount({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const isSolanaChain = isSolana(chainId)
  const isUnconnected = isSolanaChain ? !solanaAccount : !account

  if (isUnconnected) {
    return (
      <Grid gridGap="24px" gridTemplateColumns={['1fr', '1fr', '1fr', '1fr']}>
        <Box>
          <Card>
            <CardBody>
              <FlexGap alignItems="center" justifyContent="center" flexDirection="column" gap="24px">
                <Text color="textSubtle">{t('Please connect wallet to view your position / add liquidity.')}</Text>
                <ConnectWalletButton />
              </FlexGap>
            </CardBody>
          </Card>
        </Box>
      </Grid>
    )
  }
  return (
    <AutoColumn gap="lg">
      {isSolanaChain ? (
        <SolanaV3PositionsTable poolInfo={poolInfo as SolanaV3PoolInfo} />
      ) : (
        (() => {
          switch (poolInfo.protocol) {
            case 'v3':
              return <V3PositionsTable poolInfo={poolInfo} />
            case Protocol.InfinityCLAMM:
              return <InfinityCLPositionsTable poolInfo={poolInfo as InfinityCLPoolInfo} />
            case Protocol.InfinityBIN:
              return <InfinityBinPositionsTable poolInfo={poolInfo as InfinityBinPoolInfo} />
            case 'v2':
            case 'stable':
              return <V2OrSSPositionsTable poolInfo={poolInfo as V2PoolInfo | StablePoolInfo} />
            default:
              return <div>{t('Unsupported protocol: %protocol%', { protocol: poolInfo.protocol })}</div>
          }
        })()
      )}
    </AutoColumn>
  )
}
