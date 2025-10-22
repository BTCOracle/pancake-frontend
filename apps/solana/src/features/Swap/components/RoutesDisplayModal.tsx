import { AtomBox, AutoColumn, Flex, FlexGap, Modal, QuestionHelper, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useMemo } from 'react'
import styled from 'styled-components'
import { colors } from '@/theme/cssVariables'
import TokenAvatar from '@/components/TokenAvatar'
import toPercentString from '@/utils/numberish/toPercentString'
import { QuoteResponseData } from '../type'

export const RoutesDisplayModal: React.FC<{
  routePlan: QuoteResponseData['routePlan']
  routeStats: QuoteResponseData['routeStats']
}> = ({ routePlan, routeStats }) => {
  const { t } = useTranslation()
  const routes = useMemo(() => {
    /* eslint-disable no-param-reassign */
    return routePlan.reduce((acc, route) => {
      if (!acc[route.routeIndex]) {
        acc[route.routeIndex] = []
      }
      acc[route.routeIndex].push(route)
      return acc
    }, [] as QuoteResponseData['routePlan'][])
    /* eslint-enable no-param-reassign */
  }, [routePlan, routeStats])
  return (
    <Modal
      title={
        <Flex justifyContent="center">
          {t('Route')}{' '}
          <QuestionHelper
            text={t('Routing through these tokens resulted in the best price for your trade.')}
            ml="4px"
            placement="top-start"
          />
        </Flex>
      }
      style={{ minHeight: '0' }}
      bodyPadding="24px"
    >
      <FlexGap gap="12px" height="100%" flexDirection="column">
        {routes.map((route, index) => (
          <RouteDisplay key={index} route={route} />
        ))}
      </FlexGap>
    </Modal>
  )
}

const RouteDisplay = ({ route }: { route: QuoteResponseData['routePlan'] }) => {
  const percent = route[0].splitPercent
  return (
    <AutoColumn gap="24px" alignItems="center">
      <RouterBox justifyContent="space-between" alignItems="center">
        <AtomBox>
          <TokenAvatar tokenMint={route[0].inputMint} size="lg" />
          <Text bold textAlign="center">
            {toPercentString(percent * 100)}
          </Text>
        </AtomBox>
        {route.map((r, idx) => (
          <RoutePath key={idx} route={r} />
        ))}

        <AtomBox>
          <TokenAvatar tokenMint={route[route.length - 1].outputMint} size="lg" />
          <Text>&nbsp;</Text>
        </AtomBox>
      </RouterBox>
    </AutoColumn>
  )
}

const RoutePath = ({ route }: { route: QuoteResponseData['routePlan'][0] }) => {
  return (
    <AutoColumn gap="4px">
      <Flex>
        <TokenAvatar tokenMint={route.inputMint} size="sm" />
        <TokenAvatar tokenMint={route.outputMint} size="sm" />
      </Flex>
      <Text>{toPercentString(route.feeRate / 10000)}</Text>
    </AutoColumn>
  )
}

const RouterBox = styled(Flex)`
  position: relative;
  flex-direction: row;

  &:before {
    content: '';
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    height: 3px;
    border-top: 3px dotted ${colors.backgroundDisabled};
    transform: translateY(-50%);
    z-index: -1;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    min-width: 400px;
  }
`
