import { RouteType, SmartRouter } from '@pancakeswap/smart-router'
import {
  AtomBox,
  AutoColumn,
  Box,
  ChevronDownIcon,
  Flex,
  FlexGap,
  Image,
  Text,
  useMatchBreakpoints,
  useTooltip,
} from '@pancakeswap/uikit'
import { ChainLogo, CurrencyLogo, LightCard, LightGreyCard } from '@pancakeswap/widgets-internal'

import { useTranslation } from '@pancakeswap/localization'
import { ASSET_CDN } from 'config/constants/endpoints'
import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { RouterPoolBox, RouterTypeText } from 'views/Swap/components/RouterViewer'
import { useHookDiscount } from 'views/SwapSimplify/hooks/useHookDiscount'
import { isSolanaBridge } from 'views/Swap/utils'
import { isSolana } from '@pancakeswap/chains'
import { Pair, RouteDisplayEssentials } from './types'
import { EVMPairNodes } from './pairNode'

interface BridgeRoutesDisplayProps {
  routes: RouteDisplayEssentials[]
}

interface BridgeRouteDisplayProps {
  route: RouteDisplayEssentials
}

const StyledRouterPoolBox = styled(RouterPoolBox)`
  background-color: ${({ theme }) => theme.colors.input} !important;
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary} !important;
`

const RouterBox = styled(Flex)<{ $showDottedBackground?: boolean }>`
  position: relative;
  gap: 12px;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 3px;
    border-top: 3px dotted ${({ theme }) => (theme.isDark ? theme.colors.secondary20 : theme.colors.inputSecondary)};
    transform: translateY(-50%);
    z-index: 1;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    min-width: 200px;
  }

  ${({ $showDottedBackground }) =>
    $showDottedBackground === false &&
    `
      &:before {
        opacity: 0;
      }
    `}
`

const PrimaryCard = styled(Box)`
  min-width: 240px;
  padding: 8px;
  height: fit-content;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.input} !important;
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary} !important;
`

const RouteBoxHeader = styled(Box)`
  border: 2px solid ${({ theme }) => (theme.isDark ? theme.colors.secondary20 : theme.colors.tertiary20)};
  background-color: ${({ theme }) => theme.colors.tertiary};
`

const RouteModalContainer = styled(FlexGap)`
  position: relative;
  z-index: 1;

  &:before {
    content: '';
    position: absolute;
    top: 36px;
    transform: translateX(-50%);
    width: 3px;
    height: calc(100% - 72px);
    border-top: none;
    border-left: 3px dotted ${({ theme }) => (theme.isDark ? theme.colors.secondary20 : theme.colors.inputSecondary)};
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    &:before {
      top: 48px;
      left: 36px;
      width: calc(100% - 72px);
      height: 3px;
      border-top: 3px dotted ${({ theme }) => (theme.isDark ? theme.colors.secondary20 : theme.colors.inputSecondary)};
      border-left: none;
      transform: translateY(-50%);
    }
  }
`

const DottedBackgroundContainer = styled(FlexGap)`
  position: relative;
  z-index: 1;

  &:before {
    content: '';
    position: absolute;

    top: 16px;
    left: 0;
    width: 100%;
    height: 3px;
    border-top: 3px dotted ${({ theme }) => (theme.isDark ? theme.colors.secondary80 : theme.colors.inputSecondary)};
    border-left: none;
    transform: translateY(-50%);
    z-index: 0;
  }

  > * {
    position: relative;
    z-index: 1;
  }
`

const StyledBridgeLogo = styled(Image)`
  border: 1px solid ${({ theme }) => theme.colors.inputSecondary};
  border-radius: 100%;
`

const AnimatedContent = styled(Box)<{ $height: number }>`
  height: ${({ $height }) => `${$height}px`};
  overflow: hidden;
  transition: height 0.2s ease-in-out;
`

export const BridgeRoutesDisplay = ({ routes }: BridgeRoutesDisplayProps) => {
  const { t } = useTranslation()
  const bridgeRouteIndex = routes.findIndex((route) => route.type === RouteType.BRIDGE)!

  const bridgeRoute = routes[bridgeRouteIndex]

  const { inputAmount, outputAmount } = bridgeRoute
  const { currency: bridgeInputCurrency } = inputAmount
  const { currency: bridgeOutputCurrency } = outputAmount

  const inputCurrency = routes[0] && routes[0].inputAmount ? routes[0].inputAmount.currency : bridgeInputCurrency
  const outputCurrency = routes[routes.length - 1]
    ? routes[routes.length - 1].outputAmount.currency
    : bridgeOutputCurrency

  // Origin chain routes (before bridge route)
  const originChainRoutes = routes.slice(0, bridgeRouteIndex)

  // Destination chain routes (after bridge route)
  const destinationChainRoutes = routes.slice(bridgeRouteIndex + 1)

  return (
    <>
      <RouteModalContainer
        gap="24px"
        justifyContent="space-between"
        flexDirection={['column', 'column', 'column', 'row']}
        alignItems={['center', 'center', 'center', 'flex-start']}
        mb="8px"
      >
        <Box mt="24px" minWidth="42px">
          <CurrencyLogo currency={inputCurrency} size="42px" showChainLogo />
        </Box>
        {originChainRoutes.length > 0 && <BridgeChainRoutes routes={originChainRoutes} />}
        <PrimaryCard width="100%" minWidth="100px">
          <DottedBackgroundContainer
            alignItems="center"
            justifyContent="center"
            gap="16px"
            width="fit-content"
            mx="auto"
          >
            <ChainLogo
              chainId={bridgeInputCurrency.chainId}
              width={32}
              height={32}
              imageStyles={{ borderRadius: '35%' }}
            />
            <ChainLogo
              chainId={bridgeOutputCurrency.chainId}
              width={32}
              height={32}
              imageStyles={{ borderRadius: '35%' }}
            />
          </DottedBackgroundContainer>
          <Text mt="4px" textAlign="center">
            {t('Bridge')}
          </Text>
          <FlexGap mt="2px" gap="2px" alignItems="center" justifyContent="center">
            {isSolana(inputCurrency.chainId) || isSolana(outputCurrency.chainId) ? (
              <>
                <StyledBridgeLogo
                  src={`${ASSET_CDN}/web/bridges/relay.jpg`}
                  alt="Relay Bridge"
                  width={16}
                  height={16}
                />
                <Text textAlign="center" fontSize="12px">
                  Relay
                </Text>
              </>
            ) : (
              <>
                <StyledBridgeLogo
                  src={`${ASSET_CDN}/web/bridges/across.png`}
                  alt="Across Bridge"
                  width={16}
                  height={16}
                />
                <Text textAlign="center" fontSize="12px">
                  Across
                </Text>
              </>
            )}
          </FlexGap>
        </PrimaryCard>
        {destinationChainRoutes.length > 0 && <BridgeChainRoutes routes={destinationChainRoutes} />}
        <Box mt="24px" minWidth="42px">
          <CurrencyLogo currency={outputCurrency} size="42px" showChainLogo />
        </Box>
      </RouteModalContainer>
    </>
  )
}

const BridgeChainRoutes = ({ routes }: { routes: RouteDisplayEssentials[] }) => {
  const { t } = useTranslation()
  const { isDesktop } = useMatchBreakpoints()
  const [isExpanded, setIsExpanded] = useState(isDesktop)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useLayoutEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight + 12)
    }
  }, [routes])

  const inputCurrency = routes[0].inputAmount.currency
  const outputCurrency = routes[routes.length - 1].outputAmount.currency

  const poolTypes = [
    ...new Set(
      routes.flatMap((route) =>
        route.pools.map((pool) => {
          if (SmartRouter.isInfinityClPool(pool) || SmartRouter.isInfinityBinPool(pool)) {
            return 'Infinity'
          }
          if (SmartRouter.isStablePool(pool)) {
            return 'StableSwap'
          }
          if (SmartRouter.isV3Pool(pool)) {
            return 'V3'
          }
          if (SmartRouter.isV2Pool(pool)) {
            return 'V2'
          }
          return 'Unknown'
        }),
      ),
    ),
  ]

  return (
    <Box width="100%">
      <Box bg="textSubtle" py="4px" borderRadius="24px 24px 0 0" width="100%">
        <Text color="invertedContrast" textAlign="center" bold>
          {getFullChainNameById(routes[0].inputAmount.currency.chainId)}
        </Text>
        {routes.length > 1 && (
          <Text color="cardBorder" textAlign="center" small>
            {t('%split% Split', { split: routes.length })}
          </Text>
        )}
      </Box>
      <LightGreyCard padding="16px 16px 24px 16px" borderRadius="0 0 24px 24px" width="100%">
        <PrimaryCard width="100%">
          <FlexGap alignItems="center" justifyContent="center">
            <AtomBox
              size={{
                xs: '24px',
                md: '32px',
              }}
            >
              <CurrencyLogo currency={inputCurrency} size="100%" />
            </AtomBox>
            <AtomBox size={{ xs: '24px', md: '32px' }}>
              <CurrencyLogo currency={outputCurrency} size="100%" />
            </AtomBox>
          </FlexGap>

          <Text mt="8px" color="textSubtle" textAlign="center" small>
            {t('Via %poolTypes% Pool', { poolTypes: poolTypes.join(', ') })}
          </Text>
        </PrimaryCard>
        <AnimatedContent $height={isExpanded ? contentHeight : 0}>
          <div ref={contentRef}>
            <AutoColumn mt="12px" gap="12px">
              {routes.map((route, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <BridgeRouteDisplay key={i} route={route} />
              ))}
            </AutoColumn>
          </div>
        </AnimatedContent>

        <Flex
          mt="24px"
          justifyContent="center"
          alignItems="center"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ cursor: 'pointer' }}
        >
          <ChevronDownIcon color="textSubtle" width="24px" style={{ transform: isExpanded ? 'rotate(180deg)' : '' }} />
        </Flex>
      </LightGreyCard>
    </Box>
  )
}

export const BridgeRouteDisplay = memo(function BridgeRouteDisplay({ route }: BridgeRouteDisplayProps) {
  const { t } = useTranslation()
  const { hookDiscount, category } = useHookDiscount(route.pools)

  const { path, pools, percent } = route

  const pairs = useMemo<Pair[]>(() => {
    if (path.length <= 1) {
      return []
    }

    const currencyPairs: Pair[] = []
    for (let i = 0; i < path.length - 1; i += 1) {
      currencyPairs.push([path[i], path[i + 1]])
    }
    return currencyPairs
  }, [path])

  return (
    <LightCard borderRadius="24px" padding="0">
      <RouteBoxHeader borderRadius="24px 24px 0 0" p="5px 6px">
        <Text color="textSubtle" textAlign="center" bold>
          {t('%percent%%', { percent: Math.round(percent) })}
        </Text>
      </RouteBoxHeader>
      <Box p="12px 18px 64px">
        <RouterBox
          justifyContent={pairs && pairs.length > 1 ? 'space-between' : 'center'}
          alignItems="center"
          $showDottedBackground={Boolean(pairs && pairs.length > 1)}
        >
          <EVMPairNodes
            pairs={pairs}
            pools={pools}
            routePoolsLength={route.pools.length}
            hookDiscount={hookDiscount}
            category={category}
            pairNode={PairNode}
          />
        </RouterBox>
      </Box>
    </LightCard>
  )
})

function PairNode({
  pair,
  text,
  className,
  tooltipText,
}: {
  pair: Pair
  text: string | React.ReactNode
  className: string
  tooltipText: string
}) {
  const [input, output] = pair

  const tooltip = useTooltip(tooltipText)

  return (
    <StyledRouterPoolBox className={className}>
      {tooltip.tooltipVisible && tooltip.tooltip}
      <Flex ref={tooltip.targetRef}>
        <AtomBox
          size={{
            xs: '24px',
            md: '32px',
          }}
        >
          <CurrencyLogo size="100%" currency={input} />
        </AtomBox>
        <AtomBox
          size={{
            xs: '24px',
            md: '32px',
          }}
        >
          <CurrencyLogo size="100%" currency={output} />
        </AtomBox>
      </Flex>
      <RouterTypeText>{text}</RouterTypeText>
    </StyledRouterPoolBox>
  )
}
