import { HOOK_CATEGORY, HookData, POOL_TYPE } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  FlexGap,
  Heading,
  IMultiSelectProps,
  ModalBody,
  ModalCloseButton,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalV2,
  ModalV2Props,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import intersection from 'lodash/intersection'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { FilterSelect } from './FilterSelect'
import { HookCard } from './HookCard'

// Modal Styles
const StyledModalContainer = styled(ModalContainer)`
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.mediaQueries.md} {
    min-height: auto;
    min-width: 720px;
    max-width: 820px !important;
  }
`

const StyledModalBody = styled(ModalBody)`
  padding: 8px;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 24px;
  }

  background-color: ${({ theme }) => theme.colors.backgroundDisabled};

  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`

const StyledFilterContainer = styled(FlexGap)`
  & > div {
    max-width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & > div {
      max-width: 50%;
    }
  }
`

const categoriesOptions: IMultiSelectProps<string>['options'] = Object.keys(HOOK_CATEGORY).map((k) => ({
  label: HOOK_CATEGORY[k],
  value: k,
}))

type HookListModalProps = ModalV2Props & {
  data: HookData[]
  onItemClick: (item: HookData) => void
}

export const HookListModal = ({
  onDismiss,
  isOpen,
  closeOnOverlayClick = true,
  data,
  onItemClick,
}: HookListModalProps) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  const [categories, setCategories] = useState<string[]>()
  const [poolType, setPoolType] = useState<POOL_TYPE[]>()

  const hookList = useMemo(
    () =>
      data.filter(
        (item) =>
          (!poolType?.length || !item.poolType || poolType.includes(item.poolType)) &&
          (!categories?.length ||
            !item.category ||
            intersection(
              categories.map((c) => HOOK_CATEGORY[c]),
              item.category,
            ).length),
      ),
    [categories, data, poolType],
  )

  const handleReset = useCallback(() => {
    setCategories([])
    setPoolType(undefined)
  }, [])

  return (
    <ModalV2 onDismiss={onDismiss} isOpen={isOpen} closeOnOverlayClick={closeOnOverlayClick}>
      <StyledModalContainer>
        <ModalHeader style={{ border: 'none' }}>
          <ModalTitle>
            <Heading padding="0px">{t('Hook List (%hooksCount%)', { hooksCount: hookList.length })}</Heading>
          </ModalTitle>
          <ModalCloseButton onDismiss={onDismiss} />
        </ModalHeader>
        <StyledFilterContainer padding="0 16px 16px" gap="24px">
          <FilterSelect
            placeholder={t('All categories')}
            onChange={setCategories}
            data={categoriesOptions}
            value={categories}
          />
        </StyledFilterContainer>
        <StyledModalBody alignItems="center" justifyContent="center">
          {hookList.length ? (
            <FlexGap flexDirection="column" gap="12px">
              {hookList.map((hook) => {
                return <HookCard key={`${hook.address}`} hookData={hook} onClick={() => onItemClick(hook)} />
              })}
            </FlexGap>
          ) : (
            <Box minHeight="30vh">
              <Text color="textSubtle" size="sm">
                {t('No hooks available with the selected filters')}
              </Text>
              <Button variant="textPrimary60" scale="xs" p="16px" onClick={handleReset}>
                {t('Reset filters')}
              </Button>
            </Box>
          )}
        </StyledModalBody>
      </StyledModalContainer>
    </ModalV2>
  )
}
