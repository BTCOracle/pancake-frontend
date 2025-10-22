import { useTranslation } from '@pancakeswap/localization'
import {
  BaseMenu,
  Box,
  Card,
  CardBody,
  IconButton,
  ModalV2,
  MotionModal,
  SearchIcon,
  useMatchBreakpoints,
  useModalV2,
} from '@pancakeswap/uikit'
import { Suspense, useCallback, useMemo } from 'react'
import styled from 'styled-components'

import dynamic from 'next/dynamic'
import { PoolInfo } from 'state/farmsV4/state/type'
import { useRouter } from 'next/router'
import { getPoolAddLiquidityLink, getPoolDetailPageLink } from 'utils/getPoolLink'

const SearchButton = styled(IconButton).attrs({ variant: 'primary60' })`
  background-color: ${({ theme }) => theme.colors.input};
`

const UnstyledButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`

const MiniUniversalFarms = dynamic(() => import('./index').then((mod) => mod.MiniUniversalFarms), {
  ssr: false,
})

export type LinkType = 'poolDetail' | 'addLiquidity'

interface MiniUniversalFarmsOverlayProps {
  children?: React.ReactNode
  linkType?: LinkType
}

export const MiniUniversalFarmsOverlay: React.FC<MiniUniversalFarmsOverlayProps> = ({ children, linkType }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isMobile, isTablet } = useMatchBreakpoints()
  const isSmallScreen = isMobile || isTablet

  const modalV2Props = useModalV2()

  const handleOpenModal = useCallback(() => {
    if (isSmallScreen) {
      modalV2Props.onOpen()
    }
  }, [isSmallScreen, modalV2Props])

  const onPoolClick = useCallback(
    async (pool: PoolInfo) => {
      if (linkType === 'addLiquidity') {
        router.push(getPoolAddLiquidityLink(pool))
      } else {
        router.push(await getPoolDetailPageLink(pool))
      }
    },
    [linkType, router],
  )

  const triggerButton = useMemo(() => {
    return (
      children || (
        <SearchButton>
          <SearchIcon color="textSubtle" width={24} />
        </SearchButton>
      )
    )
  }, [children])

  return (
    <Box>
      {isSmallScreen ? (
        <>
          <UnstyledButton onClick={handleOpenModal}>{triggerButton}</UnstyledButton>
          <ModalV2 {...modalV2Props} closeOnOverlayClick>
            <MotionModal title={t('Search Pools')} onDismiss={modalV2Props.onDismiss}>
              <Suspense>
                <MiniUniversalFarms
                  onPoolClick={(pool) => {
                    onPoolClick?.(pool)
                    modalV2Props.onDismiss?.()
                  }}
                />
              </Suspense>
            </MotionModal>
          </ModalV2>
        </>
      ) : (
        <BaseMenu
          component={triggerButton}
          options={{
            placement: 'bottom-start',
            offset: [0, 8],
            padding: { left: 16, right: 16 },
          }}
        >
          {({ close }) => (
            <Card style={{ minWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
              <CardBody>
                <Suspense>
                  <MiniUniversalFarms
                    onPoolClick={(pool) => {
                      onPoolClick?.(pool)
                      close()
                    }}
                  />
                </Suspense>
              </CardBody>
            </Card>
          )}
        </BaseMenu>
      )}
    </Box>
  )
}
