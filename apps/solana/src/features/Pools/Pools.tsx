import {
  Box,
  Collapse,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Stack,
  Switch,
  Tag,
  Text,
  useBreakpointValue,
  useDisclosure,
  useOutsideClick,
  useUpdateEffect
} from '@chakra-ui/react'
import { Trans, useTranslation } from '@pancakeswap/localization'
import { ApiV3Token, FetchPoolParams, PoolFetchType } from '@pancakeswap/solana-core-sdk'
import { ButtonMenu, ButtonMenuItem } from '@pancakeswap/uikit'
import { AllCommunityModule, ColDef, ModuleRegistry, themeQuartz } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Button from '@/components/Button'
import List, { ListPropController } from '@/components/List'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import PageHeroTitle from '@/components/PageHeroTitle'
import { Select } from '@/components/Select'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenSearchInput from '@/components/TokenSearchInput'
import useFetchMainInfo from '@/hooks/info/useFetchMainInfo'
import { AprKey, FormattedPoolInfoItem } from '@/hooks/pool/type'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useFetchPoolByMint from '@/hooks/pool/useFetchPoolByMint'
import useFetchPoolList from '@/hooks/pool/useFetchPoolList'
import { useEvent } from '@/hooks/useEvent'
import usePrevious from '@/hooks/usePrevious'
import useResponsive from '@/hooks/useResponsive'
import useSort from '@/hooks/useSort'
import GridIcon from '@/icons/misc/GridIcon'
import ListIcon from '@/icons/misc/ListIcon'
import MoreListControllers from '@/icons/misc/MoreListControllers'
import OpenBookIcon from '@/icons/misc/OpenBookIcon'
import SearchIcon from '@/icons/misc/SearchIcon'
import { useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { revertAppLayoutPaddingX } from '@/theme/detailConfig'
import { ASSET_CDN } from '@/utils/config/endpoint'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import toPercentString from '@/utils/numberish/toPercentString'
import { isValidPublicKey } from '@/utils/publicKey'
import { setUrlQuery, useRouteQuery } from '@/utils/routeTools'
import { mintToUrl, urlToMint } from '@/utils/token'

import CreatePoolButton from './components/CreatePoolButton'
import PoolChartModal from './components/PoolChart'
import PoolItemLoadingSkeleton from './components/PoolItemLoadingSkeleton'
import PoolListItem from './components/PoolListItem'
import { ColumnsPoolActions } from './components/PoolTableColumns/ColumnsPoolActions'
import { ColumnPoolApr } from './components/PoolTableColumns/ColumnsPoolApr'
import { ColumnsPoolLiquidity } from './components/PoolTableColumns/ColumnsPoolLiquidity'
import { ColumnPoolName } from './components/PoolTableColumns/ColumnsPoolName'
import TVLInfoPanel, { TVLInfoPanelMobile } from './components/TVLInfoPanel'
import { useScrollTitleCollapse } from './useScrollTitleCollapse'
import { getFavoritePoolCache, POOL_SORT_KEY } from './util'
import { useEffectWithUrl, useStateWithUrl } from '../../hooks/useStateWithUrl'

ModuleRegistry.registerModules([AllCommunityModule])

export type PoolPageQuery = {
  token?: string
  search?: string
  tab?: 'concentrated' | 'standard' | 'all'
  layout?: 'list' | 'grid'
}

type PoolTabItem = {
  name: string
  label: string
  value: PoolFetchType
}

export type TimeBase = '24h' | '7d' | '30d'

export const FILED_KEY: Record<TimeBase, AprKey> = {
  '24h': AprKey.Day,
  '7d': AprKey.Week,
  '30d': AprKey.Month
}

const SORT_ITEMS = [
  {
    name: 'default',
    label: <Trans>Default</Trans>,
    value: 'default'
  },
  {
    name: 'tvl_dsc',
    label: <Trans>TVL (dsc)</Trans>,
    value: 'tvl_desc'
  },
  {
    name: 'tvl_asc',
    label: <Trans>TVL (asc)</Trans>,
    value: 'tvl_asc'
  },
  {
    name: 'volume_24h_dsc',
    label: <Trans>Trading Volume (24h) (dsc)</Trans>,
    value: 'volume_24h_desc'
  },
  {
    name: 'volume_24h_asc',
    label: <Trans>Trading Volume (24h) (asc)</Trans>,
    value: 'volume_24h_asc'
  }
  // {
  //   name: 'lp_dsc',
  //   label: <Trans>Liquidity (dsc)</Trans>,
  //   value: 'liquidity_desc'
  // },
  // {
  //   name: 'lp_asc',
  //   label: <Trans>Liquidity (asc)</Trans>,
  //   value: 'liquidity_asc'
  // },
  // {
  //   name: 'apr_dsc',
  //   label: <Trans>Yield (dsc)</Trans>,
  //   value: 'apr_desc'
  // },
  // {
  //   name: 'apr_asc',
  //   label: <Trans>Yield (asc)</Trans>,
  //   value: 'apr_asc'
  // }
]

const LAYOUT_ITEMS = [
  { value: 'list', label: <ListIcon key="list-icon" /> },
  { value: 'grid', label: <GridIcon key="grid-icon" /> }
]

const EmptyRow = () => {
  const { t } = useTranslation()
  return (
    <Box flexGrow="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" role="presentation">
      <img width={156} height={179} alt="empty placeholder" src={`${ASSET_CDN}/web/universalFarms/empty_list_bunny.png`} />
      <Text mt="4" fontSize="sm" color={colors.textSecondary}>
        {t('No pools found')}
      </Text>
    </Box>
  )
}

export default function Pools() {
  const { t, currentLanguage } = useTranslation()
  const query = useRouteQuery()
  const currentQuery = useRef(query)
  currentQuery.current = query || {}
  const isEN = currentLanguage.locale === 'en'
  const { isTablet, isMobile } = useResponsive()

  const gridTheme = useMemo(
    () =>
      themeQuartz.withParams({
        wrapperBorder: true,
        wrapperBorderRadius: '24px',
        headerFontSize: '12px',
        headerTextColor: colors.secondary,
        headerFontWeight: 600,
        headerBackgroundColor: colors.cardBg,
        headerHeight: '43px',
        rowHeight: 75,
        dataFontSize: '18px',
        pinnedColumnBorder: false,
        borderColor: colors.cardBorder01,
        backgroundColor: colors.cardBg,
        foregroundColor: colors.textPrimary
      }),
    []
  )

  const tabItems: PoolTabItem[] = useMemo(
    () => [
      {
        name: 'V3',
        label: 'V3',
        value: PoolFetchType.Concentrated
      },
      {
        name: 'All',
        label: isEN && isMobile ? 'ALL' : t('All'),
        value: PoolFetchType.All
      }
    ],
    [isEN, isMobile, t]
  )

  const listControllerIconSize = useBreakpointValue({ base: '24px', sm: '24px' })
  const gridCardSize = useBreakpointValue({ base: undefined, sm: 290 })
  const gridCardGap = useBreakpointValue({ base: 4, sm: 5 })
  const { isOpen: isChartOpen, onOpen: openChart, onClose: closeChart } = useDisclosure()
  const { isOpen: isMobileSearchOpen, onOpen: openMobileSearch, onClose: closeMobileSearch } = useDisclosure()
  const [chartPoolInfo, setChartPoolInfo] = useState<FormattedPoolInfoItem>()

  // -------- search --------
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [searchTokens, setSearchTokens] = useState<ApiV3Token[]>([])
  const skipSyncQuery = useRef(false)

  const { order, sortKey, onChangeSortData, setOrder } = useSort({
    defaultKey: 'default'
  })

  useEffectWithUrl(
    'token',
    (query_) => {
      if (!query_) return
      if (!tokenMap.size) return
      const tokenMints = query_.split(',')
      const searchTokens_: ApiV3Token[] = []
      let searchMints = ''
      tokenMints.forEach((mint) => {
        const token = tokenMap.get(urlToMint(mint)!)
        if (token) searchTokens_.push(token)
        if (!searchMints && isValidPublicKey(mint)) searchMints = mint
      })

      if (searchTokens_.length) {
        skipSyncQuery.current = true
        setSearchTokens(searchTokens_)
      }
      if (searchMints) {
        setSearchText((searchText) => searchText || searchMints)
        // eslint-disable-next-line no-unused-expressions
        isMobile && openMobileSearch()
      }
    },
    [tokenMap]
  )

  const [searchText, setSearchText] = useState('')
  const favoritePools = getFavoritePoolCache()
  const { data: infoData } = useFetchMainInfo({})
  const isSearchPublicKey = isValidPublicKey(searchText)

  // -------- detail setting: show farms --------
  // need api
  const [showFarms, setShowFarms] = useStateWithUrl(false, 'show_farms', {
    fromUrl: (u) => u === 'true',
    toUrl: (v) => String(v)
  })

  // -------- detail setting: time base --------
  const [timeBase, setTimeBase] = useStateWithUrl<TimeBase>(Object.keys(FILED_KEY)[0] as TimeBase, 'time_base', {
    fromUrl: (u) => u as TimeBase,
    toUrl: (v) => v
  })

  const handleOpenChart = useCallback(
    (info: FormattedPoolInfoItem) => {
      openChart()
      setChartPoolInfo(info)
    },
    [openChart]
  )

  const defaultColumnDefs: ColDef<FormattedPoolInfoItem> = useMemo(() => {
    return {
      headerStyle: {
        textTransform: 'uppercase'
      }
    }
  }, [])

  const columnDefs: ColDef<FormattedPoolInfoItem>[] = useMemo(() => {
    if (isMobile) {
      return [
        {
          headerName: t('Pool'),
          flex: 1.5,
          field: 'poolName',
          cellRenderer: ColumnPoolName,
          cellRendererParams: {
            timeBase
          },
          headerStyle: {
            textTransform: 'uppercase'
          }
        },
        {
          headerName: t('APR %timeBase%', { timeBase }),
          flex: 1,
          field: 'poolName',
          headerStyle: {
            textTransform: 'uppercase'
          },
          type: 'centerAligned',
          resizable: false,
          cellRenderer: ColumnPoolApr,
          cellRendererParams: {
            timeBase
          }
        }
      ] satisfies ColDef<FormattedPoolInfoItem>[]
    }

    if (isTablet) {
      return [
        {
          headerName: t('Pool'),
          flex: 1,
          field: 'poolName',
          cellRenderer: ColumnPoolName,
          cellRendererParams: {
            timeBase
          }
        },
        {
          headerName: t('Volume %timeBase%', { timeBase }),
          flex: 1,
          field: `${FILED_KEY[timeBase]}.volume`,
          valueFormatter: ({ value }) => formatCurrency(value, { symbol: '$', decimalPlaces: 0 })
        },
        {
          headerName: t('APR %timeBase% ', { timeBase }),
          flex: 1,
          field: `${FILED_KEY[timeBase]}.apr`,
          resizable: false,
          cellRenderer: ColumnPoolApr,
          cellRendererParams: {
            timeBase
          },
          headerStyle: {
            paddingRight: '20px',
            paddingLeft: '1px'
          },
          type: 'rightAligned'
        },
        {
          colId: 'op',
          resizable: false,
          cellRenderer: ColumnsPoolActions,
          pinned: 'right',
          cellRendererParams: {
            onOpenChart: handleOpenChart
          }
        }
      ] satisfies ColDef<FormattedPoolInfoItem>[]
    }
    return [
      {
        headerName: t('Pool'),
        headerStyle: {
          paddingLeft: '56px',
          paddingRight: '0'
        },
        flex: 2,
        field: 'poolName',
        cellRenderer: ColumnPoolName,
        cellRendererParams: {
          timeBase
        }
      },
      {
        headerName: t('TVL'),
        field: 'tvl',
        flex: 1,
        cellRenderer: ColumnsPoolLiquidity,
        headerStyle: {
          paddingRight: '47px',
          paddingLeft: '1px'
        },
        type: 'rightAligned'
      },
      {
        headerName: t('Volume %timeBase%', { timeBase }),
        flex: 1,
        field: `${FILED_KEY[timeBase]}.volume`,
        valueFormatter: ({ value }) => formatCurrency(value, { symbol: '$', abbreviated: true, decimalPlaces: 3 }),
        headerStyle: {
          paddingRight: '47px',
          paddingLeft: '1px'
        },
        cellStyle: {
          paddingRight: '47px'
        },
        type: 'rightAligned'
      },
      {
        headerName: t('Fees %timeBase%', { timeBase }),
        flex: 1,
        field: `${FILED_KEY[timeBase]}.volumeFee`,
        valueFormatter: ({ value }) => formatCurrency(value, { symbol: '$', abbreviated: true, decimalPlaces: 3 }),
        headerStyle: {
          paddingRight: '47px',
          paddingLeft: '1px'
        },
        cellStyle: {
          paddingRight: '47px'
        },
        type: 'rightAligned'
      },
      {
        headerName: t('APR %timeBase%', { timeBase }),
        flex: 1,
        field: `${FILED_KEY[timeBase]}.apr`,
        cellRenderer: ColumnPoolApr,
        cellRendererParams: {
          timeBase
        },
        headerStyle: {
          paddingRight: '47px',
          paddingLeft: '1px'
        },
        cellStyle: {
          paddingRight: '47px'
        },
        type: 'rightAligned',
        resizable: false
      },
      {
        colId: 'op',
        resizable: false,
        cellRenderer: ColumnsPoolActions,
        pinned: 'right',
        width: 250,
        cellRendererParams: {
          onOpenChart: handleOpenChart
        }
      }
    ] satisfies ColDef<FormattedPoolInfoItem>[]
  }, [timeBase, isMobile, isTablet, handleOpenChart, t])

  const [timeBaseIdx, handleTimeBaseChange] = useMemo(
    () => [
      Object.keys(FILED_KEY).indexOf(timeBase),
      (idx: number) => setTimeBase((Object.keys(FILED_KEY)[idx] ?? Object.keys(FILED_KEY)[0]) as keyof typeof FILED_KEY)
    ],
    [timeBase, setTimeBase]
  )

  const [urlSortKey, setUrlSortKey] = useStateWithUrl(sortKey, 'sort_by', {
    fromUrl: (u) => u,
    toUrl: (v) => v
  })

  const [urlOrder, setUrlOrder] = useStateWithUrl('desc', 'order', {
    fromUrl: (u) => u,
    toUrl: (v) => v
  })

  useUpdateEffect(() => {
    if (skipSyncQuery.current) {
      skipSyncQuery.current = false
      return
    }
    setUrlQuery({
      ...currentQuery.current,
      token: searchTokens.length ? searchTokens.map(({ address }) => mintToUrl(address)).join(',') : undefined
    })
  }, [searchTokens])

  // -------- detail setting: layout --------
  const [currentLayoutStyle, setCurrentLayoutStyle] = useStateWithUrl('list', 'layout', {
    fromUrl: (u) => (u === 'grid' ? 'grid' : 'list'),
    toUrl: (v) => (v === 'grid' ? 'grid' : 'list')
  })
  const [layoutStyle, handleLayoutStyleChange] = useMemo(
    () => [
      LAYOUT_ITEMS.findIndex((i) => i.value === currentLayoutStyle),
      (idx: number) => setCurrentLayoutStyle((LAYOUT_ITEMS[idx] ?? LAYOUT_ITEMS[0]).value as 'list' | 'grid')
    ],
    [currentLayoutStyle, setCurrentLayoutStyle]
  )

  // -------- tab --------
  const [activeTabItem, setActiveTabItem] = useStateWithUrl(tabItems[0], 'tab', {
    fromUrl: (u) => tabItems.find((item) => item.value === u) ?? tabItems[0],
    toUrl: (v) => v.value
  })
  const activeTabIdx = useMemo(() => tabItems.findIndex((item) => item.value === activeTabItem.value) ?? 0, [tabItems, activeTabItem.value])
  const onPoolValueChange = useEvent((idx: number = 0) => {
    const newActiveTabItem = tabItems[idx]
    if (newActiveTabItem) {
      setActiveTabItem(newActiveTabItem)
    } else {
      setActiveTabItem(tabItems[0])
    }
  })

  // -------- control list --------
  const listControllerRef = useRef<ListPropController>()
  useEffect(() => {
    listControllerRef.current?.resetRenderCount()
  }, [activeTabItem, currentLayoutStyle, showFarms, timeBase])

  const search = searchTokens.reduce((acc, cur) => `${acc},${cur.address}`, '')
  const hasSearch = searchTokens.length > 0
  const {
    formattedData: orgData,
    loadMore: orgLoadMore,
    isLoadEnded: isOrgLoadedEnd,
    isLoading: isOrgLoading
  } = useFetchPoolList({
    showFarms,
    shouldFetch: !hasSearch,
    type: activeTabItem.value,
    order: order ? 'desc' : 'asc',
    // sort: sortKey !== 'liquidity' && sortKey !== 'default' ? `${sortKey}${timeBase}` : sortKey
    sort: sortKey !== 'liquidity' && sortKey !== 'default' ? `${sortKey}` : sortKey
  })

  const {
    formattedData: searchMintData,
    isLoadEnded: isSearchMintLoadEnded,
    isLoading: isSearchMintLoading
  } = useFetchPoolByMint({
    showFarms,
    mint1: searchTokens[0]?.address,
    mint2: searchTokens[1]?.address,
    type: activeTabItem.value,
    order: order ? 'desc' : 'asc',
    // sort: (sortKey !== 'liquidity' && sortKey !== 'default' ? `${sortKey}${timeBase}` : sortKey) as FetchPoolParams['sort']
    sort: (sortKey !== 'liquidity' && sortKey !== 'default' ? `${sortKey}` : sortKey) as FetchPoolParams['sort']
  })

  const { formattedData: searchIdData, isLoading: isSearchIdLoading } = useFetchPoolById({
    idList: [searchText],
    type: activeTabItem.value
  })

  const searchData = searchIdData?.length ? searchIdData : searchMintData
  const isSearchLoading = isSearchPublicKey ? isSearchIdLoading || isSearchMintLoading : isSearchMintLoading
  const isSearchLoadEnded = isSearchPublicKey ? !isSearchIdLoading && isSearchMintLoadEnded : isSearchMintLoadEnded
  const isNotFound = (searchTokens.length > 0 || isSearchPublicKey) && !isSearchLoading && !searchData.length

  const data = hasSearch || searchIdData?.length ? searchData : orgData
  const isLoading = hasSearch ? isSearchLoading : isOrgLoading
  const isLoadEnded = hasSearch ? isSearchLoadEnded : isOrgLoadedEnd
  const loadMore = hasSearch ? () => {} : orgLoadMore
  const sortedData = useMemo(() => {
    // if (!favoritePools.size) return data
    const favorite: FormattedPoolInfoItem[] = []
    const normal: FormattedPoolInfoItem[] = []
    data.forEach((p) => {
      if (favoritePools.has(p.id)) {
        favorite.push(p)
      } else {
        normal.push(p)
      }
    })
    return [...favorite, ...normal]
  }, [data, favoritePools])

  const prevSearch = usePrevious(search)
  const sortRef = useRef<string>('default')

  useEffect(() => {
    const sort = sortRef.current.match(/[a-zA-Z]+/g)?.[0] || 'default'
    if (sortRef.current === sort) return
    onChangeSortData(sort)
  }, [timeBase, onChangeSortData])

  useEffect(() => {
    if (urlSortKey === sortKey || !POOL_SORT_KEY[urlSortKey as keyof typeof POOL_SORT_KEY]) return
    onChangeSortData(urlSortKey)
  }, [])

  useEffect(() => {
    const urlOrderNum = urlOrder === 'asc' ? 0 : 1
    if (urlOrderNum === order) return
    setOrder(urlOrderNum)
  }, [])

  useUpdateEffect(() => {
    setUrlOrder(order === 0 ? 'asc' : 'desc')
  }, [order])

  const handleSwitchFarmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setShowFarms(e.currentTarget.checked)
  }

  const handleClickSort = (propertyName: string) => {
    onChangeSortData(propertyName)
    setUrlSortKey(propertyName)
  }

  // secondary controller bar
  const { containerProps, titleContainerProps, scrollBodyProps } = useScrollTitleCollapse()
  const { isOpen: isCollapseOpen, onToggle: toggleSubcontrollers } = useDisclosure()

  const [tvl, volume] = infoData ? [infoData.totalTvlUsd, infoData.totalVolume24h] : ['0', '0']

  const renderPoolListItem = useCallback(
    (info: FormattedPoolInfoItem) => (
      <PoolListItem timeBase={timeBase} field={FILED_KEY[timeBase]} pool={info} onOpenChart={handleOpenChart} />
    ),
    [handleOpenChart, currentLayoutStyle, timeBase]
  )
  const searchRef = useRef<HTMLDivElement>(null)
  useOutsideClick({
    ref: searchRef,
    handler() {
      if (searchText === '' && searchTokens.length === 0) {
        closeMobileSearch()
      }
    }
  })

  const listContainerStyle = useMemo(
    () => ({
      pr: '5px',
      mr: '-5px'
    }),
    []
  )

  return (
    <>
      <Flex flexDirection="column" height="100%" flexGrow={1} lineHeight={1.5} {...containerProps}>
        {/* Title Part */}
        <Box {...titleContainerProps} display={['none', 'block']} flexShrink={0}>
          <Desktop>
            <HStack justify="space-between" w="full" py={8}>
              <PageHeroTitle title={t('Liquidity Pools')} description={t('Provide liquidity') || ''} />
              <TVLInfoPanel tvl={tvl} volume={volume} />
            </HStack>
          </Desktop>
        </Box>

        <Mobile>
          <Box {...titleContainerProps} mb={0.5} flexShrink={0} marginX={revertAppLayoutPaddingX}>
            <TVLInfoPanelMobile tvl={tvl} volume={volume} />
          </Box>
        </Mobile>

        {/* Controller Part */}
        <Box
          border={`1px solid ${colors.cardBorder01}`}
          borderRadius="16px"
          borderBottomWidth="2px"
          bgColor={colors.cardBg}
          px={[4, 6]}
          py={[2, 4]}
          mb="16px"
        >
          <Grid
            columnGap={3}
            gridTemplate={[
              `
              "tabs more btn" auto
              "coll coll  coll" auto
              "search search search" auto / auto auto 1fr
            `,
              `
              "tabs search more btn" auto
              "coll coll coll  coll" auto / auto auto auto 1fr
            `,
              `
              "tabs search more btn" auto
              "coll coll coll  coll" auto / auto auto auto 1fr
            `
            ]}
            backgroundColor="transparent"
            alignItems="center"
          >
            <GridItem area="tabs">
              <Desktop>
                <ButtonMenu scale="sm" activeIndex={activeTabIdx} onItemClick={onPoolValueChange} variant="subtle">
                  {tabItems.map(({ label, value }) => (
                    <ButtonMenuItem key={value} height="38px">
                      {label}
                    </ButtonMenuItem>
                  ))}
                </ButtonMenu>
              </Desktop>
              <Mobile>
                <Select
                  sx={({ isPanelOpen }) => ({
                    borderRadius: 'full',
                    height: '40px',
                    minWidth: '102px',
                    border: `1px solid ${colors.inputBorder}`,
                    borderColor: isPanelOpen ? 'currentcolor' : colors.inputBorder
                  })}
                  popoverContentSx={{
                    border: `1px solid ${colors.cardBorder01}`
                  }}
                  value={activeTabItem.value}
                  items={tabItems}
                  onChange={(value) => onPoolValueChange(tabItems.findIndex((i) => i.value === value))}
                />
              </Mobile>
            </GridItem>

            <GridItem area="search">
              {(!isMobile || isMobileSearchOpen) && (
                <TokenSearchInput
                  ref={searchRef}
                  width={['unset', '24em']}
                  mt={['8px', 0]}
                  value={searchText}
                  onChange={setSearchText}
                  selectedListValue={searchTokens}
                  onSelectedListChange={setSearchTokens}
                  hideAutoComplete={!!searchIdData}
                />
              )}
            </GridItem>

            <GridItem area="more">
              <Flex gap={3}>
                {isMobile && !isMobileSearchOpen && (
                  <Button
                    color={colors.textSubtle}
                    border={`1px solid ${colors.inputBorder}`}
                    background={colors.inputBg}
                    onClick={openMobileSearch}
                    variant="capsule"
                    height="40px"
                  >
                    <SearchIcon color={colors.textSubtle} opacity={0.5} width="16px" height="16px" />
                  </Button>
                )}
                <Button
                  background={colors.inputBg}
                  border={`1px solid ${colors.inputBorder}`}
                  borderBottomWidth="2px"
                  onClick={toggleSubcontrollers}
                  variant="capsule"
                  height="40px"
                  paddingInline="4"
                  isActive={isCollapseOpen}
                >
                  <MoreListControllers color={colors.textSubtle} width={listControllerIconSize} height={listControllerIconSize} />
                </Button>
              </Flex>
            </GridItem>

            <GridItem area="btn" justifySelf="end">
              {/* Action Buttons create pool */}
              <CreatePoolButton />
            </GridItem>

            <GridItem area="coll">
              <Collapse in={isCollapseOpen}>
                <Box pt={[4, 4]} pb={[0, 2]}>
                  <Stack direction={['column', 'row']} alignItems={['start', 'center']} spacing={[4, 10]} borderRadius="12px">
                    {/* Widgets */}
                    <Box>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel color={colors.textSubtle} minW={['80px', 'unset']}>
                          {t('Layout')}
                        </FormLabel>

                        <ButtonMenu scale="sm" activeIndex={layoutStyle} onItemClick={handleLayoutStyleChange} variant="subtle">
                          {LAYOUT_ITEMS.map(({ label, value }) => (
                            <ButtonMenuItem key={value} height="38px">
                              {label}
                            </ButtonMenuItem>
                          ))}
                        </ButtonMenu>
                      </FormControl>
                    </Box>

                    {/* <Box>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel color={colors.textSubtle} minW={['80px', 'unset']}>
                          {t('Time base')}
                        </FormLabel>
                        <ButtonMenu scale="sm" activeIndex={timeBaseIdx} onItemClick={handleTimeBaseChange} variant="subtle">
                          {Object.keys(FILED_KEY)
                            .map((key) => ({
                              value: key as TimeBase,
                              label: (key as TimeBase).toLocaleUpperCase()
                            }))
                            .map(({ label, value }) => (
                              <ButtonMenuItem key={value} height="38px">
                                {label}
                              </ButtonMenuItem>
                            ))}
                        </ButtonMenu>
                      </FormControl>
                    </Box> */}

                    <Flex alignItems="center">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel color={colors.textSubtle} minW={['80px', 'unset']}>
                          {t('Show Farms')}
                        </FormLabel>
                        <Switch defaultChecked={showFarms} onChange={handleSwitchFarmChange} />
                      </FormControl>
                    </Flex>

                    {currentLayoutStyle === 'grid' ? (
                      <Flex alignItems="center">
                        <FormControl display="flex" alignItems="center">
                          <FormLabel color={colors.textSubtle} minW={['80px', 'unset']}>
                            {t('Sort By')}
                          </FormLabel>
                          <Select
                            sx={({ isPanelOpen }) => ({
                              height: '34px',
                              minWidth: '80px',
                              border: '1px solid transparent',
                              borderColor: isPanelOpen ? 'currentcolor' : 'transparent',
                              fontSize: '14px'
                            })}
                            popoverContentSx={{}}
                            value={sortKey === 'default' ? t('default') : t(`${sortKey}_${order ? 'desc' : 'asc'}`)}
                            items={SORT_ITEMS}
                            onChange={(value) => {
                              const parts = value.split('_')
                              const order_ = parts[parts.length - 1]
                              const key = value === 'default' ? 'default' : parts.slice(0, -1).join('_')
                              onChangeSortData(key)
                              setOrder(order_ === 'desc' ? 1 : 0)
                            }}
                          />
                        </FormControl>
                      </Flex>
                    ) : null}
                  </Stack>
                </Box>
              </Collapse>
            </GridItem>
          </Grid>
        </Box>

        {currentLayoutStyle === 'list' ? (
          <div style={{ minHeight: '45vh', flex: 1, paddingBottom: '20px' }}>
            <AgGridReact
              loading={isLoading}
              theme={gridTheme}
              rowData={sortedData}
              columnDefs={columnDefs}
              defaultColDef={defaultColumnDefs}
              noRowsOverlayComponent={EmptyRow}
            />
          </div>
        ) : (
          <>
            {isNotFound ? (
              <Box {...listContainerStyle} flexGrow="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <img width={156} height={179} alt="empty placeholder" src={`${ASSET_CDN}/web/universalFarms/empty_list_bunny.png`} />
                <Text mt="4" fontSize="sm" color={colors.textSecondary}>
                  {t('No pools found')}
                </Text>
              </Box>
            ) : (
              <>
                {isLoading ? (
                  <Box {...listContainerStyle} px="24px" py="12px">
                    <PoolItemLoadingSkeleton isGrid />
                  </Box>
                ) : (
                  <List
                    id="iil-li"
                    controllerRef={listControllerRef}
                    {...scrollBodyProps}
                    increaseRenderCount={showFarms ? 100 : 50}
                    initRenderCount={30}
                    reachBottomMargin={showFarms ? 200 : 150}
                    preventResetOnChange={search === prevSearch}
                    gridSlotCount={isMobile ? 1 : undefined}
                    gridSlotItemMinWidth={gridCardSize}
                    haveLoadAll={isLoadEnded}
                    onLoadMore={loadMore}
                    items={sortedData}
                    getItemKey={(item) => item.id}
                    gap={gridCardGap}
                    zIndex={1}
                    {...listContainerStyle}
                  >
                    {renderPoolListItem}
                  </List>
                )}
              </>
            )}
          </>
        )}

        {/* Pool list item modal chart Modal */}
        <Desktop>
          <PoolChartModal
            renderModalHeader={
              <Flex alignItems="center" gap={2}>
                <TokenAvatarPair token1={chartPoolInfo?.mintA} token2={chartPoolInfo?.mintB} />
                <Text>
                  {chartPoolInfo?.mintA.symbol} / {chartPoolInfo?.mintB.symbol}
                </Text>
                <Tag size="sm" variant="rounded">
                  {formatToRawLocaleStr(toPercentString(chartPoolInfo?.feeRate, { alreadyPercented: false }))}
                </Tag>
                {chartPoolInfo?.isOpenBook ? (
                  <Tag size="sm" variant="rounded">
                    <OpenBookIcon />
                  </Tag>
                ) : null}
              </Flex>
            }
            poolAddress={chartPoolInfo?.id}
            baseMint={chartPoolInfo?.mintA.address}
            categories={[
              { label: t('Volume'), value: 'volume' },
              { label: t('Liquidity'), value: 'liquidity' },
              { label: t('TVL'), value: 'tvl' }
            ]}
            isOpen={isChartOpen}
            onClose={closeChart}
          />
        </Desktop>
      </Flex>
    </>
  )
}
