import { Trans, useTranslation } from '@pancakeswap/localization'
import {
  AutoRow,
  Button,
  Column,
  Flex,
  Link,
  Message,
  MessageText,
  Text,
  TooltipText,
  useTooltip,
} from '@pancakeswap/uikit'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { LightGreyCard } from 'components/Card'

import { ChainId } from '@pancakeswap/chains'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { getMerklLink } from 'utils/getMerklLink'
import { Protocol } from '@pancakeswap/farms'
import useMerkl from '../../hooks/useMerkl'

function TextWarning({ tokenAmount }: { tokenAmount: CurrencyAmount<Currency> }) {
  const { t } = useTranslation()
  const { tooltip, tooltipVisible, targetRef } = useTooltip(
    t('Combined number of rewards in %symbol% from ALL your positions which are eligible for Merkl rewards.', {
      symbol: tokenAmount.currency.symbol,
    }),
    {
      placement: 'top',
      trigger: 'hover',
    },
  )

  return (
    <>
      <TooltipText ref={targetRef} small>
        {tokenAmount.toSignificant(6)}
      </TooltipText>
      {tooltipVisible && tooltip}
    </>
  )
}

const LearnMoreLink = () => {
  const { t } = useTranslation()

  return (
    <Link color="currentColor" fontSize="md" external style={{ display: 'inline-flex' }} href="https://docs.merkl.xyz/">
      {t('Learn more about Merkl')}
    </Link>
  )
}

export function MerklSection({
  poolAddress,
  poolProtocol,
  chainId,
  notEnoughLiquidity,
  outRange,
  disabled,
}: {
  poolAddress?: `0x${string}`
  poolProtocol?: Protocol
  chainId?: ChainId
  notEnoughLiquidity: boolean
  outRange: boolean
  disabled: boolean
}) {
  const { t } = useTranslation()

  const { claimTokenReward, isClaiming, rewardsPerToken, hasMerkl } = useMerkl(poolAddress)

  const merklLink = getMerklLink({ hasMerkl, chainId, lpAddress: poolAddress, poolProtocol })

  if (!rewardsPerToken.length || (!hasMerkl && rewardsPerToken.every((r) => r.equalTo('0')))) return null

  return (
    <Column justifyContent="space-between" gap="8px" width="100%">
      <AutoRow justifyContent="space-between">
        <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
          {t('Merkl Rewards')}
        </Text>
        <Button
          disabled={disabled || isClaiming || rewardsPerToken.every((r) => r.equalTo('0'))}
          scale="sm"
          onClick={claimTokenReward}
        >
          {isClaiming ? t('Claiming...') : t('Claim')}
        </Button>
      </AutoRow>
      <LightGreyCard mr="4px" padding="16px 8px">
        {rewardsPerToken.map((tokenAmount) => (
          <AutoRow justifyContent="space-between">
            <Flex>
              <CurrencyLogo currency={tokenAmount.currency} />
              <Text small color="textSubtle" id="remove-liquidity-tokenb-symbol" ml="4px">
                {tokenAmount.currency.symbol}
              </Text>
            </Flex>
            <Flex justifyContent="center">
              <TextWarning tokenAmount={tokenAmount} />
            </Flex>
          </AutoRow>
        ))}
      </LightGreyCard>

      {outRange ? (
        <Message variant="warning">
          <MessageText color="textSubtle">
            {t('This Merkl campaign is NOT rewarding out-of-range liquidity. To earn rewards, adjust your position.')}
            <br />
            <LearnMoreLink />
          </MessageText>
        </Message>
      ) : hasMerkl ? (
        <Message variant={notEnoughLiquidity ? 'warning' : 'primary'}>
          <MessageText color={notEnoughLiquidity ? 'textSubtle' : ''}>
            <Trans
              i18nKey={
                notEnoughLiquidity
                  ? 'This liquidity position will NOT earn any rewards on Merkl due to its total USD value being less than $20. Details <0>here</0>'
                  : 'This liquidity position is currently earning rewards on Merkl. Details <0>here</0>'
              }
              components={[
                <Link
                  fontSize="md"
                  external
                  color="currentColor"
                  style={{ display: 'inline-flex' }}
                  href={merklLink ?? 'https://merkl.angle.money/?search=PancakeSwap&status=live%2Csoon'}
                />,
              ]}
            />
            <br />
            <LearnMoreLink />
          </MessageText>
        </Message>
      ) : null}
    </Column>
  )
}
