import { BottomDrawer, Button, ChevronRightIcon, Column, MoreIcon } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { memo, ReactNode, useCallback, useState } from 'react'
import { getFarmAprInfo, getFarmKey } from 'state/farmsV4/search/farm.util'
import { PoolInfo } from 'state/farmsV4/state/type'
import styled from 'styled-components'
import { getPoolDetailPageLink } from 'utils/getPoolLink'
import { PoolGlobalAprButton } from './PoolAprButton'
import { ActionItems } from './PoolListItemAction'
import { PoolTokenOverview, useColumnMobileConfig } from './useColumnConfig'

const ListContainer = styled.ul``

const ListItemContainer = styled.li`
  display: flex;
  padding: 12px 16px;
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: 1px solid ${({ theme }) => theme.card.background};

  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  }
`

interface IPoolListViewProps<T extends PoolInfo> {
  data: T[]
  onRowClick?: (item: PoolInfo) => void
  getItemKey?: (item: T) => string
}
export const ListView = <T extends PoolInfo>({ data, getItemKey, onRowClick }: IPoolListViewProps<T>) => {
  const [openItem, setOpenItem] = useState<PoolInfo | null>(null)
  const handleDrawerChange = useCallback((status: boolean) => {
    if (!status) setOpenItem(null)
  }, [])
  const router = useRouter()
  const handleItemClick = useCallback(
    async (item: PoolInfo) => {
      const link = await getPoolDetailPageLink(item)
      router.push(link)
    },
    [router],
  )

  const getListItemKey = useCallback(
    (item: T) => {
      if (getItemKey) {
        return getItemKey(item)
      }
      if (item.farm) {
        return getFarmKey(item.farm)
      }
      return [item.chainId, item.protocol, item.lpAddress ?? item.poolId ?? ''].join(':')
    },
    [getItemKey],
  )

  const handleMoreClick = (e, item) => {
    e.stopPropagation()
    setOpenItem(item)
  }

  return (
    <ListContainer>
      {data.map((item) => (
        <ListItemContainer key={getListItemKey(item)} onClick={() => onRowClick?.(item)}>
          <Column gap="12px" onClick={() => handleItemClick(item)}>
            <PoolTokenOverview data={item} />
            <PoolGlobalAprButton pool={item} aprInfo={getFarmAprInfo(item.farm)?.aprInfo} />
          </Column>

          <Column>
            <Button scale="xs" variant="text" onClick={(e) => handleMoreClick(e, item)} py="2rem" pl="1rem">
              <MoreIcon />
            </Button>
          </Column>
        </ListItemContainer>
      ))}

      <BottomDrawer
        drawerContainerStyle={{ height: 'auto' }}
        isOpen={openItem !== null}
        setIsOpen={handleDrawerChange}
        content={<ListItemDetails data={openItem} />}
      />
    </ListContainer>
  )
}

const ItemDetailContainer = styled.div``

const ItemDetailHeader = styled.div`
  display: flex;
  padding: 16px 0 8px;
  justify-content: center;
`

const Grabber = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 9999px;
  opacity: 0.1;
  background: ${({ theme }) => theme.colors.contrast};
`
const ItemDetailFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};

  && button {
    display: flex;
    padding: 12px 16px;
    justify-content: space-between;
    gap: 8px;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 400;
    line-height: 24px;
    width: 100%;
  }
`

const ItemDetailBody = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px;
  font-weight: 600;
`

const ListItem = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-end;
  line-height: 150%;
`

const ListItemLabel = styled(Column)`
  text-transform: uppercase;
`

export interface IListItemDetailsProps {
  data: PoolInfo | null
}

const ListItemDetails: React.FC<IListItemDetailsProps> = memo(({ data }) => {
  const columns = useColumnMobileConfig()

  if (!data) {
    return null
  }

  return (
    <ItemDetailContainer>
      <ItemDetailHeader>
        <Grabber />
      </ItemDetailHeader>
      <ItemDetailBody>
        <PoolTokenOverview data={data} />
        {columns.map((col) => (
          <ListItem key={col.key}>
            <ListItemLabel>
              {typeof col.title === 'function'
                ? col.title()
                : typeof col.title === 'string'
                ? col.title.toUpperCase()
                : col.title}
            </ListItemLabel>
            <Column>
              {col.render
                ? col.render(col.dataIndex ? data[col.dataIndex] : data, data, 0)
                : col.dataIndex
                ? (data[col.dataIndex] as ReactNode)
                : null}
            </Column>
          </ListItem>
        ))}
      </ItemDetailBody>
      <ItemDetailFooter>
        <ActionItems pool={data} icon={<ChevronRightIcon />} />
      </ItemDetailFooter>
    </ItemDetailContainer>
  )
})
