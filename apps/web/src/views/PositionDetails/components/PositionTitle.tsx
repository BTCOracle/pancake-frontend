import { Protocol } from '@pancakeswap/farms'
import { HookData } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, AutoRow, Box, FeeTier, Flex, FlexGap, Tag, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ChainLogo, DoubleCurrencyLogo, Liquidity } from '@pancakeswap/widgets-internal'
import { InfinityFeeTierBreakdown } from 'components/FeeTierBreakdown'
import { RangeTag } from 'components/RangeTag'
import { TokenPairLogo } from 'components/TokenImage'
import { UnsafeCurrency } from 'config/constants/types'
import { styled } from 'styled-components'
import { chainNameConverter } from 'utils/chainNameConverter'
import { isInfinityProtocol } from 'utils/protocols'
import { Address } from 'viem'
import { getChainFullName } from 'views/universalFarms/utils'

export const Wrapper = styled(FlexGap)`
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
`
const DetailInfoTitle = styled.div<{ $isMobile?: boolean }>`
  display: flex;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
  margin-top: 4px;
`

export interface LiquidityDetailHeaderProps {
  currency0: UnsafeCurrency
  currency1: UnsafeCurrency
  chainId: number
  tokenId?: bigint | number
  feeTier?: number
  feeTierBase?: number
  protocol?: Protocol
  isActive?: boolean
  isFarming?: boolean
  isRemoved?: boolean
  isOutOfRange?: boolean
  hookData?: HookData
  dynamic?: boolean
  poolId?: Address
  showPoolFeature?: boolean
  size?: 'sm' | 'lg'
  displayLabelOnMobile?: boolean
  displayGlobalSettings?: boolean
}

export const LiquidityTitle: React.FC<LiquidityDetailHeaderProps> = ({
  currency0,
  currency1,
  tokenId,
  chainId,
  protocol,
  feeTier,
  feeTierBase = 1_000_000,
  isFarming = false,
  isRemoved = false,
  isOutOfRange = false,
  hookData,
  dynamic,
  poolId,
  showPoolFeature = true,
  size = 'lg',
  displayLabelOnMobile = true,
  displayGlobalSettings = false,
}) => {
  const { t } = useTranslation()
  const chainName = chainId ? getChainFullName(chainId) : undefined
  const { isMobile } = useMatchBreakpoints()
  const showAsCompact = displayLabelOnMobile && isMobile

  return (
    <Wrapper gap="16px" alignItems="center">
      <FlexGap gap="12px" columnGap="12px" style={{ width: '100%' }}>
        {currency0 && currency1 && size === 'lg' ? (
          <Flex justifyContent="center" flexDirection="column" width={48}>
            <TokenPairLogo
              width={48}
              height={48}
              variant="inverted"
              primaryToken={currency0}
              secondaryToken={currency1.wrapped}
            />
          </Flex>
        ) : null}
        <Flex flexDirection="column" width="100%">
          <FlexGap gap="8px" alignItems="center">
            {currency0 && currency1 && size === 'sm' ? (
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} innerMargin="-8px" />
            ) : null}
            <Box width="100%" ml="8px">
              {displayGlobalSettings ? (
                <AutoRow justifyContent="space-between" alignItems="center" flexWrap="nowrap">
                  <Box>
                    <Text as="span" bold fontSize="20px">{`${currency0?.symbol} / ${currency1?.symbol}`}</Text>
                    {tokenId ? (
                      <Text as="span" color="textSubtle" fontSize={['16px', null, null, '20px']} ml="4px">
                        #{tokenId.toString()}
                      </Text>
                    ) : null}
                  </Box>
                </AutoRow>
              ) : (
                <>
                  <Text as="span" bold fontSize="20px" mr="4px">{`${currency0?.symbol} / ${currency1?.symbol}`}</Text>
                  {showAsCompact ? <br /> : null}
                  {tokenId ? (
                    <Text as="span" color="textSubtle" fontSize={['16px', null, null, '20px']}>
                      #{tokenId.toString()}
                    </Text>
                  ) : null}
                </>
              )}
            </Box>
          </FlexGap>
          {!showAsCompact ? (
            <DetailInfoTitle>
              {isFarming && (
                <Tag variant="primary60" scale="sm">
                  {t('Farming')}
                </Tag>
              )}
              <RangeTag scale="sm" lowContrast removed={isRemoved} outOfRange={isOutOfRange} protocol={protocol} />
              {isInfinityProtocol(protocol) ? (
                <InfinityFeeTierBreakdown poolId={poolId} chainId={chainId} hookData={hookData} />
              ) : protocol && feeTier ? (
                <FeeTier type={protocol} fee={feeTier} dynamic={dynamic} denominator={feeTierBase} />
              ) : null}
              <FlexGap gap="3px" alignItems="center">
                <ChainLogo chainId={chainId} width={18} mt="2px" />
                <Text color="textSubtle" textTransform="uppercase" small bold style={{ whiteSpace: 'nowrap' }}>
                  {chainName ? chainNameConverter(chainName) : null}
                </Text>
              </FlexGap>
            </DetailInfoTitle>
          ) : null}
        </Flex>
      </FlexGap>
      {showAsCompact ? (
        <FlexGap gap="8px" flexWrap="wrap">
          <AutoColumn gap="4px">
            <Text fontSize={12} color="textSubtle" textTransform="uppercase" bold>
              {t('status')}
            </Text>
            <FlexGap gap="3px" alignItems="center">
              <RangeTag scale="sm" lowContrast removed={isRemoved} outOfRange={isOutOfRange} protocol={protocol} />
              {isFarming ? (
                <Tag variant="primary60" scale="sm" mr="8px">
                  {t('Farming')}
                </Tag>
              ) : null}
            </FlexGap>
          </AutoColumn>
          <AutoColumn gap="4px">
            <Text fontSize={12} color="textSubtle" textTransform="uppercase" bold>
              {t('fee tier')}
            </Text>
            {isInfinityProtocol(protocol) ? (
              <InfinityFeeTierBreakdown poolId={poolId} chainId={chainId} hookData={hookData} />
            ) : protocol && feeTier ? (
              <FeeTier type={protocol} fee={feeTier} dynamic={dynamic} denominator={feeTierBase} />
            ) : null}
          </AutoColumn>
          <AutoColumn gap="4px">
            <Text fontSize={12} color="textSubtle" textTransform="uppercase" bold>
              {t('network')}
            </Text>
            <FlexGap gap="3px" alignItems="center">
              <ChainLogo chainId={chainId} width={18} mt="2px" />
              <Text color="textSubtle" textTransform="uppercase" fontSize={12} bold>
                {chainName ? chainNameConverter(chainName) : null}
              </Text>
            </FlexGap>
          </AutoColumn>
        </FlexGap>
      ) : null}
      {showPoolFeature && (
        <FlexGap gap="16px">
          <Liquidity.PoolFeaturesBadge
            poolType={protocol}
            hookData={hookData}
            fold={false}
            labelTextProps={{ bold: true }}
          />
        </FlexGap>
      )}
    </Wrapper>
  )
}
