import { useTranslation } from '@pancakeswap/localization'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import {
  AutoColumn,
  BscScanIcon,
  Button,
  Column,
  DeleteOutlineIcon,
  IconButton,
  Input,
  Link,
  Text,
} from '@pancakeswap/uikit'
import Row, { RowBetween, RowFixed } from 'components/Layout/Row'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'
import { RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { MintLayout } from '@solana/spl-token-0.4'
import { useQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { solanaExplorerAtom } from '@pancakeswap/utils/user'
import { CheckIcon, CurrencyLogo } from '@pancakeswap/widgets-internal'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'

import { isValidSolanaAddress } from 'utils/isValidSolanaAddress'
import { Footer, Wrapper } from './ManageTokens'

import { CurrencyModalView } from './types'

function useGetTokenInfo(address?: string) {
  const connection = useSolanaConnectionWithRpcAtom()

  return useQuery({
    queryKey: ['solana-useGetTokenInfo', address],
    queryFn: async () => {
      if (!address) return null

      try {
        const onlineInfo = await connection.getAccountInfo(new PublicKey(address))

        if (!onlineInfo) throw new Error(`Token address not found`)
        const data = MintLayout.decode(onlineInfo.data)
        const mintSymbol = address.toString().substring(0, 6)
        const tokenInfo = {
          chainId: NonEVMChainId.SOLANA,
          address,
          programId: onlineInfo.owner.toBase58(),
          logoURI: '',
          symbol: mintSymbol,
          name: mintSymbol,
          decimals: data.decimals,
          tags: [],
          extensions: {},
          priority: 0,
          type: 'unknown',
        }

        return tokenInfo
      } catch (error) {
        throw new Error(`Token address not found`)
      }
    },
    enabled: Boolean(address),
  })
}

export default function SolanaManageTokens({
  setModalView,
  setImportToken,
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: SPLToken) => void
}) {
  const { t } = useTranslation()
  const { userTokens, tokenList, removeUserToken, removeAllUserTokens } = useSolanaTokenList()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentExplorer] = useAtom(solanaExplorerAtom)

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback((event) => {
    const input = event.target.value.trim()
    setSearchQuery(input)
  }, [])

  // if they input an address, use it
  const { data: searchToken, isError: isErrorSearchToken } = useGetTokenInfo(searchQuery)

  // Add token functionality
  const handleAddToken = useCallback(() => {
    if (searchToken) {
      const tokenInfo: TokenInfo = {
        chainId: NonEVMChainId.SOLANA,
        address: searchToken.address,
        programId: searchToken.programId,
        logoURI: searchToken.logoURI || '',
        symbol: searchToken.symbol,
        name: searchToken.name || searchToken.symbol || 'Unknown Token',
        decimals: searchToken.decimals,
        tags: [],
        priority: 5,
        userAdded: true,
        type: 'imported',
        extensions: {},
      }

      // Check if token already exists
      const exists = userTokens.some((token) => token.address === tokenInfo.address)
      if (!exists) {
        setImportToken(convertRawTokenInfoIntoSPLToken(tokenInfo))
        setModalView(CurrencyModalView.importToken)
      }

      // Clear search and trigger import
      setSearchQuery('')
    }
  }, [searchToken, userTokens, setImportToken, setModalView])

  const tokenListComponent = useMemo(() => {
    return userTokens.map((token) => (
      <RowBetween key={token.address} width="100%">
        <RowFixed>
          <CurrencyLogo currency={convertRawTokenInfoIntoSPLToken(token)} size="20px" />
          <Link external href={`${currentExplorer.host}/token/${token.address}`} color="textSubtle" ml="10px" mr="3px">
            {token.symbol}
          </Link>
          <a href={`${currentExplorer.host}/token/${token.address}`} target="_blank" rel="noreferrer noopener">
            <BscScanIcon width="20px" color="textSubtle" />
          </a>
        </RowFixed>
        <RowFixed>
          <IconButton variant="text" onClick={() => removeUserToken(token.address)}>
            <DeleteOutlineIcon color="textSubtle" />
          </IconButton>
        </RowFixed>
      </RowBetween>
    ))
  }, [userTokens, removeUserToken, currentExplorer.host])

  const isAddressValid = searchQuery === '' || isValidSolanaAddress(searchQuery)

  return (
    <Wrapper>
      <Column style={{ width: '100%', flex: '1 1' }}>
        <AutoColumn gap="14px">
          <Row>
            <Input
              id="token-search-input"
              scale="lg"
              placeholder="Enter Solana token address"
              value={searchQuery}
              autoComplete="off"
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
              isWarning={!isAddressValid}
            />
          </Row>
          {!isAddressValid ? (
            <Text color="failure">{t('Enter valid token address')}</Text>
          ) : isErrorSearchToken ? (
            <Text color="failure">{t('Token address not found')}</Text>
          ) : null}
          {searchToken && (
            <RowBetween width="100%" style={{ padding: '4px 20px' }}>
              <RowFixed>
                <CurrencyLogo currency={searchToken} size="24px" />
                <Column style={{ marginLeft: '12px' }}>
                  <Text bold>{searchToken.symbol}</Text>
                  <Text fontSize="12px" color="textSubtle">
                    {searchToken.name}
                  </Text>
                </Column>
              </RowFixed>
              {tokenList.some((token) => token.address === searchToken.address) ? (
                <RowFixed style={{ minWidth: 'fit-content' }}>
                  <CheckIcon />
                  <Text color="success">{t('Active')}</Text>
                </RowFixed>
              ) : (
                <Button scale="sm" onClick={handleAddToken}>
                  {t('Import')}
                </Button>
              )}
            </RowBetween>
          )}
        </AutoColumn>
        {tokenListComponent}
        <Footer>
          <Text bold color="textSubtle">
            {userTokens?.length} {userTokens.length === 1 ? t('Imported Token') : t('Imported Tokens')}
          </Text>
          {userTokens.length > 0 && (
            <Button variant="tertiary" onClick={removeAllUserTokens}>
              {t('Clear all')}
            </Button>
          )}
        </Footer>
      </Column>
    </Wrapper>
  )
}
