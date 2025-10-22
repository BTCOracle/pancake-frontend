import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Column, Text, Toggle } from '@pancakeswap/uikit'
import { ListLogo } from '@pancakeswap/widgets-internal'

import { useAtom } from 'jotai'
import { memo, useCallback } from 'react'
import { SOLANA_LISTS, TokenListKey } from 'config/solana-list'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'
import { solanaListSettingsAtom } from 'state/token/solanaTokenAtoms'

import Row, { RowFixed } from '../Layout/Row'
import { ListContainer, RowWrapper, Wrapper } from './ManageLists'

const SolanaListRow = memo(function SolanaListRow({
  listKey,
  name,
  logoURI,
}: {
  listKey: TokenListKey
  name: string
  logoURI: string
}) {
  const { t } = useTranslation()
  const [listSettings, setListSettings] = useAtom(solanaListSettingsAtom)
  const { tokenCountsByList } = useSolanaTokenList()

  const isActive = listKey === TokenListKey.PANCAKESWAP ? true : listSettings[listKey]

  // Count tokens from this specific list (simplified - in reality you'd need to track per list)
  const tokenCount = tokenCountsByList[listKey]

  const handleToggle = useCallback(() => {
    setListSettings((prev) => ({ ...prev, [listKey]: !prev[listKey] }))
  }, [listKey, setListSettings])

  return (
    <RowWrapper active={isActive} hasActiveTokens={isActive} key={listKey} id={`solana-list-row-${listKey}`}>
      <ListLogo size="40px" style={{ marginRight: '1rem' }} logoURI={logoURI} alt={`${name} list logo`} />
      <Column style={{ flex: '1' }}>
        <Row>
          <Text bold>{name}</Text>
        </Row>
        <RowFixed mt="4px">
          <Text fontSize="12px" mr="6px" textTransform="lowercase">
            {tokenCount} {t('Tokens')}
          </Text>
        </RowFixed>
      </Column>
      {listKey !== TokenListKey.PANCAKESWAP && <Toggle checked={isActive} onChange={handleToggle} />}
    </RowWrapper>
  )
})

function SolanaManageList() {
  return (
    <Wrapper>
      <ListContainer>
        <AutoColumn gap="md">
          {SOLANA_LISTS.map((list) => (
            <SolanaListRow key={list.key} listKey={list.key} name={list.name} logoURI={list.logoURI} />
          ))}
        </AutoColumn>
      </ListContainer>
    </Wrapper>
  )
}

export default SolanaManageList
