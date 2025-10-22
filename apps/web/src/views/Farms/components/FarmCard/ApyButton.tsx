import { useTranslation } from '@pancakeswap/localization'
import { Flex, RoiCalculatorModal, Text, TooltipText, useModal, useTooltip } from '@pancakeswap/uikit'
import { FarmWidget } from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import { MouseEvent, useCallback, useMemo } from 'react'

import { useFarmFromPid, useFarmUser } from 'state/farms/hooks'

import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { V2FarmWithoutStakedValue, V3FarmWithoutStakedValue } from 'state/farms/types'
import { useAccount } from 'wagmi'

export interface ApyButtonProps {
  variant: 'text' | 'text-and-button'
  pid: number
  lpSymbol: string
  lpTokenPrice?: BigNumber
  lpLabel?: string
  multiplier?: string
  cakePrice?: BigNumber
  apr?: number
  displayApr?: string
  lpRewardsApr?: number
  addLiquidityUrl?: string
  useTooltipText?: boolean
  hideButton?: boolean
  stableSwapAddress?: string
  stableLpFee?: number
  farmCakePerSecond?: string
  totalMultipliers?: string
}

const ApyButton: React.FC<React.PropsWithChildren<ApyButtonProps>> = ({
  variant,
  pid,
  lpLabel,
  lpTokenPrice = BIG_ZERO,
  lpSymbol,
  cakePrice,
  apr = 0,
  multiplier,
  displayApr,
  lpRewardsApr = 0,
  addLiquidityUrl,
  useTooltipText,
  hideButton,
  stableSwapAddress,
  stableLpFee,
  farmCakePerSecond,
  totalMultipliers,
}) => {
  const { t } = useTranslation()

  const { address: account } = useAccount()
  const farm = useFarmFromPid(pid) as V3FarmWithoutStakedValue | V2FarmWithoutStakedValue | undefined
  const { tokenBalance, stakedBalance, proxy } = useFarmUser(pid)
  const userBalanceInFarm = useMemo(() => {
    if (stakedBalance.gt(0)) {
      return stakedBalance.plus(tokenBalance)
    }
    if (proxy) {
      const proxyBalance = proxy.stakedBalance.plus(proxy.tokenBalance)
      if (proxyBalance.gt(0)) {
        return proxyBalance.plus(tokenBalance)
      }
    }
    if (farm?.version !== 3) {
      const bCakeBalance = new BigNumber(farm?.bCakeUserData?.stakedBalance ?? '0')
      if (bCakeBalance.gt(0)) {
        return bCakeBalance.plus(tokenBalance)
      }
    }
    return BIG_ZERO
  }, [farm, stakedBalance, proxy, tokenBalance])

  const [onPresentApyModal] = useModal(
    <RoiCalculatorModal
      key={pid}
      account={account}
      pid={pid}
      linkLabel={t('Add %symbol%', { symbol: lpLabel })}
      stakingTokenBalance={userBalanceInFarm}
      stakingTokenDecimals={18}
      stakingTokenSymbol={lpSymbol}
      stakingTokenPrice={lpTokenPrice.toNumber()}
      earningTokenPrice={cakePrice?.toNumber() ?? 0}
      apr={apr + lpRewardsApr}
      multiplier={multiplier}
      displayApr={displayApr}
      linkHref={addLiquidityUrl}
      lpRewardsApr={lpRewardsApr}
      isFarm
      stableSwapAddress={stableSwapAddress}
      stableLpFee={stableLpFee}
      farmCakePerSecond={farmCakePerSecond}
      totalMultipliers={totalMultipliers}
    />,
    false,
    true,
    `FarmModal${pid}`,
  )

  const handleClickButton = useCallback(
    (event: MouseEvent): void => {
      event.stopPropagation()
      onPresentApyModal()
    },
    [onPresentApyModal],
  )

  const aprTooltip = useTooltip(
    <>
      <Text>
        {t('Combined APR')}: <b>{displayApr}%</b>
      </Text>
      <ul>
        <li>
          {t('Farm APR')}:{' '}
          <b>
            <Text display="inline-block" style={{ fontWeight: 800 }}>
              {apr.toFixed(2)}%
            </Text>
          </b>
        </li>
        <li>
          {t('LP Fee APR')}: <b>{lpRewardsApr.toFixed(2)}%</b>
        </li>
      </ul>
      <br />
      <Text>
        {t('Calculated using the total active liquidity staked versus the CAKE reward emissions for the farm.')}
      </Text>
      <Text mt="15px">{t('APRs for individual positions may vary depending on the configs.')}</Text>
    </>,
  )
  return (
    <>
      <FarmWidget.FarmApyButton
        variant={variant}
        hideButton={hideButton}
        strikethrough={false}
        handleClickButton={handleClickButton}
      >
        {useTooltipText ? (
          <>
            <TooltipText ref={aprTooltip.targetRef} decorationColor="secondary" style={{ whiteSpace: 'nowrap' }}>
              <Flex ml="4px" mr="5px" style={{ gap: 5 }}>
                <Text>{displayApr}%</Text>
              </Flex>
            </TooltipText>
          </>
        ) : (
          <>{displayApr}%</>
        )}
      </FarmWidget.FarmApyButton>
      {aprTooltip.tooltipVisible && aprTooltip.tooltip}
    </>
  )
}

export default ApyButton
