import { useDebounce } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Route } from '@pancakeswap/smart-router'
import { Box, ModalV2, QuestionHelperV2, SkeletonV2, Text, useModalV2 } from '@pancakeswap/uikit'
import { memo } from 'react'
import { styled } from 'styled-components'

import { RowBetween } from 'components/Layout/Row'
import SwapRoute from 'views/Swap/components/SwapRoute'
import { RoutingSettingsModalContent } from 'components/Menu/GlobalSettings/SettingsModalV2'
import {
  RouteDisplayEssentials,
  RouteDisplayModal,
  RoutesDisplayButtonView,
} from '../../Swap/V3Swap/components/RouteDisplayModal'
import { useWallchainStatus } from '../../Swap/V3Swap/hooks/useWallchain'

interface Props {
  routes?: RouteDisplayEssentials[]
  wrapperStyle?: React.CSSProperties
  loading?: boolean
}

const RouteInfoContainer = styled(RowBetween)`
  padding: 4px 24px 0;
`

export const RoutesBreakdown = memo(function RoutesBreakdown({ routes = [], wrapperStyle, loading }: Props) {
  const [wallchainStatus] = useWallchainStatus()
  const { t } = useTranslation()
  const routeDisplayModal = useModalV2()
  const deferWallchainStatus = useDebounce(wallchainStatus, 500)

  if (!routes.length) {
    return null
  }

  const count = routes.length

  return (
    <>
      <RouteInfoContainer style={wrapperStyle}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <QuestionHelperV2
            text={
              deferWallchainStatus === 'found'
                ? t(
                    'A Bonus route provided by API is automatically selected for your trade to achieve the best price for your trade.',
                  )
                : t(
                    'Route is automatically calculated based on your routing preference to achieve the best price for your trade.',
                  )
            }
            placement="top-start"
          >
            <Text fontSize="14px" color="textSubtle" style={{ textDecoration: 'underline dotted' }}>
              {deferWallchainStatus === 'found' ? t('Bonus Route') : t('Route')}
            </Text>
          </QuestionHelperV2>
        </span>
        <SkeletonV2 width="120px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={!loading}>
          <RoutesDisplayButtonView onClick={routeDisplayModal.onOpen}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {count > 1 ? (
                <Text fontSize="14px">{t('%count% Separate Routes', { count })}</Text>
              ) : (
                <RouteComp route={routes[0]} />
              )}
            </span>
          </RoutesDisplayButtonView>
        </SkeletonV2>
        <RouteDisplayModal {...routeDisplayModal} routes={routes} />
      </RouteInfoContainer>
    </>
  )
})

export const XRoutesBreakdown = memo(function XRoutesBreakdown({ wrapperStyle, loading }: Props) {
  const { t } = useTranslation()
  const { isOpen, setIsOpen, onDismiss } = useModalV2()

  return (
    <>
      <RouteInfoContainer style={wrapperStyle}>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <QuestionHelperV2
            text={t(
              'Route is automatically calculated based on your routing preference to achieve the best price for your trade.',
            )}
            placement="top-start"
          >
            <Text fontSize="14px" color="textSubtle" style={{ textDecoration: 'underline dotted' }}>
              {t('Route')}
            </Text>
          </QuestionHelperV2>
        </span>
        <Box>
          <SkeletonV2 width="120px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={!loading}>
            <RoutesDisplayButtonView onClick={() => setIsOpen(true)}>
              <Text fontSize="14px">PancakeSwap X</Text>
            </RoutesDisplayButtonView>
            <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
              <RoutingSettingsModalContent />
            </ModalV2>
          </SkeletonV2>
        </Box>
      </RouteInfoContainer>
    </>
  )
})

interface RouteProps {
  route: Pick<Route, 'path' | 'type'>
}

function RouteComp({ route }: RouteProps) {
  const { path, type } = route

  return (
    <RowBetween>
      <SwapRoute path={path} type={type} />
    </RowBetween>
  )
}
