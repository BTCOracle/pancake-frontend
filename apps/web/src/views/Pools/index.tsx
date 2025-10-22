import { styled } from 'styled-components'

import { ChainId } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { checkIsBoostedPool } from '@pancakeswap/pools'
import { Token } from '@pancakeswap/sdk'
import {
  Flex,
  FlexLayout,
  Heading,
  Image,
  Link,
  Loading,
  PageHeader,
  Text,
  ViewMode,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { Pool } from '@pancakeswap/widgets-internal'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import PinnedFAQButton from 'components/PinnedFAQButton'
import { TokenPairImage } from 'components/TokenImage'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsPageFetch, usePools } from 'state/pools/hooks'
import { useAccount } from 'wagmi'
import AprRow from './components/PoolCard/AprRow'
import CardActions from './components/PoolCard/CardActions'
import CardFooter from './components/PoolCard/CardFooter'
import PoolControls from './components/PoolControls'
import PoolRow from './components/PoolsTable/PoolRow'
import faqConfig from './faqConfig'

const StyledPageHeader = styled(PageHeader)`
  padding-top: 8px;
  margin-left: -8px;
  margin-right: -8px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-top: 56px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-top: 32px;
  }
`

const CardLayout = styled(FlexLayout)`
  justify-content: center;
`

const FinishedTextContainer = styled(Flex)`
  padding-bottom: 32px;
  flex-direction: column;
  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

const FinishedTextLink = styled(Link)`
  font-weight: 400;
  white-space: nowrap;
  text-decoration: underline;
`

const Pools: React.FC<React.PropsWithChildren> = () => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const { pools, userDataLoaded } = usePools()
  const { isMobile } = useMatchBreakpoints()

  usePoolsPageFetch()

  const poolContent = (
    <PoolControls pools={pools}>
      {({ chosenPools, viewMode, stakedOnly, normalizedUrlSearch, showFinishedPools }) => (
        <>
          {showFinishedPools && chainId === ChainId.BSC && (
            <FinishedTextContainer>
              <Text fontSize={['16px', null, '20px']} color="failure" pr="4px">
                {t('Looking for v1 CAKE syrup pools?')}
              </Text>
              <FinishedTextLink
                href="https://v1-farms.pancakeswap.finance/pools/history"
                fontSize={['16px', null, '20px']}
                color="failure"
              >
                {t('Go to migration page')}.
              </FinishedTextLink>
            </FinishedTextContainer>
          )}
          {account && !userDataLoaded && stakedOnly && (
            <Flex justifyContent="center" mb="4px">
              <Loading />
            </Flex>
          )}
          {viewMode === ViewMode.CARD ? (
            <CardLayout>
              {chosenPools.map((pool) => (
                <Pool.PoolCard<Token>
                  key={pool.sousId}
                  pool={pool}
                  isBoostedPool={Boolean(chainId && checkIsBoostedPool(pool.contractAddress, chainId))}
                  isStaked={Boolean(pool?.userData?.stakedBalance?.gt(0))}
                  cardContent={
                    account ? (
                      <CardActions pool={pool} stakedBalance={pool?.userData?.stakedBalance} />
                    ) : (
                      <>
                        <Text mb="10px" textTransform="uppercase" fontSize="12px" color="textSubtle" bold>
                          {t('Start earning')}
                        </Text>
                        <ConnectWalletButton />
                      </>
                    )
                  }
                  tokenPairImage={
                    <TokenPairImage
                      primaryToken={pool.earningToken}
                      secondaryToken={pool.stakingToken}
                      width={64}
                      height={64}
                    />
                  }
                  cardFooter={<CardFooter pool={pool} account={account ?? ''} />}
                  aprRow={<AprRow pool={pool} stakedBalance={pool?.userData?.stakedBalance} />}
                />
              ))}
            </CardLayout>
          ) : (
            <Pool.PoolsTable>
              {chosenPools.map((pool) => (
                <PoolRow
                  initialActivity={normalizedUrlSearch.toLowerCase() === pool.earningToken.symbol?.toLowerCase()}
                  key={pool.sousId}
                  sousId={pool.sousId}
                  account={account ?? ''}
                />
              ))}
            </Pool.PoolsTable>
          )}
          <Image
            mx="auto"
            mt="12px"
            src="/images/decorations/3d-syrup-bunnies.png"
            alt="Pancake illustration"
            width={192}
            height={184.5}
          />
        </>
      )}
    </PoolControls>
  )

  return (
    <>
      {isMobile ? (
        <StyledPageHeader>
          <Flex alignItems="baseline" width="100%" justifyContent="space-between" mt="16px" mb="16px">
            <Text lineHeight="110%" bold color="secondary" fontSize="32px">
              {t('Syrup Pools')}
            </Text>
            {isMobile ? (
              <PinnedFAQButton
                docLink="https://docs.pancakeswap.finance/products/syrup-pool/syrup-pool-guide"
                faqConfig={faqConfig}
              />
            ) : null}
          </Flex>
          {isMobile ? poolContent : null}
        </StyledPageHeader>
      ) : (
        <PageHeader>
          <Flex justifyContent="space-between" flexDirection={['column', null, null, 'row']}>
            <Flex flex="1" flexDirection="column" mr={['8px', 0]}>
              <Heading as="h1" scale="xxl" color="secondary" mb="24px">
                {t('Syrup Pools')}
              </Heading>
              <Heading scale="md" color="text">
                {t('Just stake some tokens to earn.')}
              </Heading>
              <Heading scale="md" color="text">
                {t('High APR, low risk.')}
              </Heading>
            </Flex>
          </Flex>
        </PageHeader>
      )}
      {isMobile ? null : <Page>{poolContent}</Page>}
    </>
  )
}

export default Pools
