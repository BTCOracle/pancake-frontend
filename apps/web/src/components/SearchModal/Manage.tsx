import { useTranslation } from '@pancakeswap/localization'
import { SPLToken, Token } from '@pancakeswap/sdk'
import { TokenList } from '@pancakeswap/token-lists'
import { ButtonMenu, ButtonMenuItem, ModalBody } from '@pancakeswap/uikit'
import { useState } from 'react'
import { NonEVMChainId } from '@pancakeswap/chains'
import { styled } from 'styled-components'
import ManageLists from './ManageLists'
import ManageTokens from './ManageTokens'
import { CurrencyModalView } from './types'
import SolanaManageList from './SolanaManageList'
import SolanaManageTokens from './SolanaManageTokens'

const StyledButtonMenu = styled(ButtonMenu)`
  width: 100%;
`

export default function Manage({
  setModalView,
  setImportList,
  setImportToken,
  setListUrl,
  chainId,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token | SPLToken) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
  chainId?: number
}) {
  const [showLists, setShowLists] = useState(true)

  const { t } = useTranslation()

  return (
    <ModalBody style={{ overflow: 'visible' }}>
      <StyledButtonMenu
        activeIndex={showLists ? 0 : 1}
        onItemClick={() => setShowLists((prev) => !prev)}
        scale="sm"
        variant="subtle"
        mb="32px"
      >
        <ButtonMenuItem width="50%">{t('Lists')}</ButtonMenuItem>
        <ButtonMenuItem width="50%">{t('Tokens')}</ButtonMenuItem>
      </StyledButtonMenu>

      {showLists ? (
        chainId === NonEVMChainId.SOLANA ? (
          <SolanaManageList />
        ) : (
          <ManageLists
            setModalView={setModalView}
            setImportList={setImportList}
            setListUrl={setListUrl}
            chainId={chainId}
          />
        )
      ) : chainId === NonEVMChainId.SOLANA ? (
        <SolanaManageTokens setModalView={setModalView} setImportToken={setImportToken} />
      ) : (
        <ManageTokens setModalView={setModalView} setImportToken={setImportToken} chainId={chainId} />
      )}
    </ModalBody>
  )
}
