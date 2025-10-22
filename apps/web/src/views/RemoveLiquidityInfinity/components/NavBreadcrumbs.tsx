import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { Breadcrumbs, DropdownMenu, Text } from '@pancakeswap/uikit'
import MenuItem from '@pancakeswap/uikit/components/MenuItem/MenuItem'
import { usePositionIdRoute } from 'hooks/dynamicRoute/usePositionIdRoute'
import { $path } from 'next-typesafe-url'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useMemo, useRef } from 'react'

type NavBreadcrumbsProps = {
  currency0: Currency | undefined
  currency1: Currency | undefined
}

type RouteWithPositionId = '/liquidity/position/[[...positionId]]'

export const NavBreadcrumbs: React.FC<React.PropsWithChildren<NavBreadcrumbsProps>> = ({
  currency0,
  currency1,
  children,
}) => {
  const { t } = useTranslation()
  const { routeParams, protocol } = usePositionIdRoute()
  const router = useRouter()
  const ref = useRef<HTMLUListElement>(null)

  const prevUrlPath = useMemo(() => {
    if (
      !routeParams ||
      !routeParams.positionId ||
      !protocol ||
      ![Protocol.InfinityBIN, Protocol.InfinityCLAMM].includes(protocol)
    )
      return ''

    const p = protocol as Protocol.InfinityBIN | Protocol.InfinityCLAMM

    return $path({
      route: router.route as RouteWithPositionId,
      routeParams: {
        positionId:
          p === Protocol.InfinityBIN
            ? [p, routeParams?.positionId[1] as string]
            : [p, routeParams?.positionId[1] as number],
      },
    })
  }, [protocol, routeParams, router.route])

  const compacted = useMemo(() => {
    if (!ref.current || typeof window === 'undefined') return false

    const { clientHeight } = ref.current
    const styleHeight = window.getComputedStyle(ref.current).lineHeight
    const computedHeight = parseInt(styleHeight.replace('px', ''))

    return 2 * computedHeight < clientHeight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current])

  return (
    <Breadcrumbs ref={ref}>
      <Link href="/liquidity/pools">{t('Farm')}</Link>

      {compacted ? (
        <DropdownMenu items={[{ label: `${currency0?.symbol} / ${currency1?.symbol}`, href: prevUrlPath }]}>
          <MenuItem>
            <Text color="primary">...</Text>
          </MenuItem>
        </DropdownMenu>
      ) : (
        <Link href={prevUrlPath}>{`${currency0?.symbol} / ${currency1?.symbol}`}</Link>
      )}

      {children}
    </Breadcrumbs>
  )
}
