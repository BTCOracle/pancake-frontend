import {
  AddIcon,
  Balance,
  Box,
  Button,
  Flex,
  IconButton,
  MinusIcon,
  Skeleton,
  SkeletonV2,
  Text,
  useMatchBreakpoints,
  useModal,
  useTooltip,
} from '@pancakeswap/uikit'
import { Pool } from '@pancakeswap/widgets-internal'

import { useTranslation } from '@pancakeswap/localization'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { PoolCategory } from 'config/constants/types'
import { useERC20 } from 'hooks/useContract'
import { useAccount } from 'wagmi'

import { Token } from '@pancakeswap/sdk'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { getBalanceNumber } from '@pancakeswap/utils/formatBalance'
import { styled } from 'styled-components'
import { useProfileRequirement } from 'views/Pools/hooks/useProfileRequirement'

import { useCallback } from 'react'
import { logGTMClickEnablePoolEvent } from 'utils/customGTMEventTracking'
import { useApprovePool } from '../../../hooks/useApprove'
import NotEnoughTokensModal from '../../Modals/NotEnoughTokensModal'
import StakeModal from '../../Modals/StakeModal'
import { ProfileRequirementWarning } from '../../ProfileRequirementWarning'
import { ActionContainer, ActionContent, ActionTitles } from './styles'

const IconButtonWrapper = styled.div`
  display: flex;
`

interface StackedActionProps {
  pool: Pool.DeserializedPool<Token>
}

const Staked: React.FunctionComponent<React.PropsWithChildren<StackedActionProps>> = ({ pool }) => {
  const {
    sousId,
    stakingToken,
    earningToken,
    stakingLimit,
    isFinished,
    poolCategory,
    userData,
    profileRequirement,
    stakingTokenPrice = 0,
    userDataLoaded,
  } = pool
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { isMobile } = useMatchBreakpoints()

  const stakingTokenContract = useERC20(stakingToken.address)
  const { handleApprove: handlePoolApprove, pendingTx: pendingPoolTx } = useApprovePool(
    stakingTokenContract,
    sousId,
    earningToken.symbol,
  )

  const handleApprove = useCallback(() => {
    handlePoolApprove()

    logGTMClickEnablePoolEvent(stakingToken.symbol)
  }, [handlePoolApprove, stakingToken.symbol])

  const pendingTx = pendingPoolTx

  const isBnbPool = poolCategory === PoolCategory.BINANCE
  const allowance = userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const hasStake = stakedBalance.gt(0)

  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO

  const stakedTokenBalance = getBalanceNumber(stakedBalance, stakingToken.decimals)
  const stakedTokenDollarBalance = stakingTokenPrice
    ? getBalanceNumber(stakedBalance.multipliedBy(stakingTokenPrice), stakingToken.decimals)
    : 0

  const needsApproval = !allowance.gt(0) && !isBnbPool

  const [onPresentTokenRequired] = useModal(
    <NotEnoughTokensModal tokenSymbol={stakingToken.symbol} tokenAddress={stakingToken.address} />,
  )

  const [onPresentStake] = useModal(
    <StakeModal
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenBalance={stakingTokenBalance}
      stakingTokenPrice={stakingTokenPrice}
    />,
  )

  const [onPresentUnstake] = useModal(
    <StakeModal
      stakingTokenBalance={stakingTokenBalance}
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenPrice={stakingTokenPrice}
      isRemovingStake
    />,
  )

  const { notMeetRequired, notMeetThreshold } = useProfileRequirement(profileRequirement)

  const onStake = () => {
    onPresentStake()
  }

  const onUnstake = () => {
    onPresentUnstake()
  }

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t("You've already staked the maximum amount you can stake in this pool!"),
    { placement: 'bottom' },
  )

  const reachStakingLimit = stakingLimit?.gt(0) && userData?.stakedBalance?.gte(stakingLimit)
  if (!account) {
    if (isMobile) {
      return <ConnectWalletButton width="100%" />
    }
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Start staking')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <ConnectWalletButton width="100%" />
        </ActionContent>
      </ActionContainer>
    )
  }

  if (!userDataLoaded) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Start staking')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Skeleton width={180} height="32px" marginTop={14} />
        </ActionContent>
      </ActionContainer>
    )
  }

  if (notMeetRequired || notMeetThreshold) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Enable pool')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <ProfileRequirementWarning profileRequirement={profileRequirement} />
        </ActionContent>
      </ActionContainer>
    )
  }

  if (needsApproval && !hasStake && !pool.isFinished) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
            {t('Enable pool')}
          </Text>
        </ActionTitles>
        <ActionContent>
          <Button width="100%" disabled={pendingTx} onClick={handleApprove} variant="secondary">
            {t('Enable.Approval')}
          </Button>
        </ActionContent>
      </ActionContainer>
    )
  }

  // Wallet connected, user data loaded and approved
  if (hasStake) {
    return (
      <>
        <ActionContainer flex={1}>
          <ActionContent mt={0}>
            <Flex flex="1" flexDirection="column" alignSelf="flex-start">
              <ActionTitles>
                <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
                  {stakingToken.symbol}{' '}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
                  {t('Staked')}
                </Text>
              </ActionTitles>
              <Flex mt={2}>
                <Box position="relative">
                  <Flex>
                    <Balance lineHeight="1" bold fontSize="20px" decimals={5} value={stakedTokenBalance} />
                  </Flex>
                  <SkeletonV2
                    isDataReady={Number.isFinite(stakedTokenDollarBalance)}
                    width={120}
                    wrapperProps={{ height: '20px' }}
                    skeletonTop="2px"
                  >
                    <Balance
                      fontSize="12px"
                      display="inline"
                      color="textSubtle"
                      decimals={2}
                      value={stakedTokenDollarBalance}
                      unit=" USD"
                      prefix="~"
                    />
                  </SkeletonV2>
                </Box>
              </Flex>
            </Flex>
            <IconButtonWrapper>
              <IconButton variant="secondary" onClick={onUnstake} mr="6px">
                <MinusIcon color="primary" width="14px" />
              </IconButton>
              {reachStakingLimit ? (
                <span ref={targetRef}>
                  <IconButton variant="secondary" disabled>
                    <AddIcon color="textDisabled" width="24px" height="24px" />
                  </IconButton>
                </span>
              ) : (
                <IconButton
                  variant="secondary"
                  onClick={stakingTokenBalance.gt(0) ? onStake : onPresentTokenRequired}
                  disabled={isFinished}
                >
                  <AddIcon color="primary" width="14px" />
                </IconButton>
              )}
            </IconButtonWrapper>
            {tooltipVisible && tooltip}
          </ActionContent>
        </ActionContainer>
      </>
    )
  }

  return (
    <ActionContainer>
      <ActionTitles>
        <Text fontSize="12px" bold color="secondary" as="span" textTransform="uppercase">
          {t('Stake')}{' '}
        </Text>
        <Text fontSize="12px" bold color="textSubtle" as="span" textTransform="uppercase">
          {stakingToken.symbol}
        </Text>
      </ActionTitles>
      <ActionContent>
        <Button
          width="100%"
          onClick={stakingTokenBalance.gt(0) ? onStake : onPresentTokenRequired}
          variant="secondary"
          disabled={isFinished}
        >
          {t('Stake')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
}

export default Staked
