import { ChainId, NonEVMChainId, UnifiedChainId, getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Token, Native } from '@pancakeswap/sdk'
import {
  AutoColumn,
  Box,
  Button,
  CheckmarkCircleIcon,
  ColumnCenter,
  Flex,
  FlexGap,
  Link,
  Spinner,
  Text,
} from '@pancakeswap/uikit'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { ConfirmationPendingContent } from '@pancakeswap/widgets-internal'
import { ChainLogo } from 'components/Logo/ChainLogo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { BalanceData } from 'hooks/useAddressBalance'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useCallback, useMemo } from 'react'
import { styled } from 'styled-components'
import { useBlockExploreLink, useBlockExploreName } from 'utils'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEnhancedTokenLogo } from './hooks/useEnhancedTokenLogo'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 0px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 24px 0;
`

interface SendTransactionModalProps {
  asset: BalanceData
  amount: string
  recipient: string
  onDismiss?: () => void
  onBack?: () => void
  txHash?: string
  attemptingTxn: boolean
  pendingText?: string
  errorMessage?: string
  onConfirm: () => void
  currency?: Currency
  chainId?: UnifiedChainId
  estimatedFee?: string | null
  estimatedFeeUsd?: string | null
}

// Confirm Transaction Screen
export function ConfirmTransactionContent({
  asset,
  amount,
  recipient,
  onConfirm,
  estimatedFee,
  estimatedFeeUsd,
}: {
  asset: BalanceData
  amount: string
  recipient: string
  onConfirm: () => void
  estimatedFee?: string | null
  estimatedFeeUsd?: string | null
  onBack?: () => void
}) {
  const { t } = useTranslation()
  const { getEnhancedLogoURI } = useEnhancedTokenLogo()

  const { connected: isSolanaConnected, connect: connectSolanaWallet } = useWallet()

  const chainName = useMemo(() => {
    if (asset.chainId === NonEVMChainId.SOLANA) {
      return 'SOLANA'
    }
    return (asset.chainId === ChainId.BSC ? 'BNB' : getChainName(asset.chainId)).toUpperCase()
  }, [asset.chainId])

  const { chainId } = useActiveChainId()
  const isChainMatched = useMemo(() => {
    if (asset.chainId === NonEVMChainId.SOLANA) {
      return isSolanaConnected
    }
    return chainId === asset.chainId
  }, [chainId, asset.chainId, isSolanaConnected])

  const evmNativeCurrency = useNativeCurrency(asset.chainId)
  const nativeCurrency = useMemo(() => {
    if (asset.chainId === NonEVMChainId.SOLANA) {
      return { symbol: 'SOL', decimals: 9 }
    }
    return evmNativeCurrency
  }, [asset.chainId, evmNativeCurrency])

  const { switchNetwork } = useSwitchNetwork()

  const tokenAmount = useMemo(() => {
    if (asset.chainId === NonEVMChainId.SOLANA) {
      // Solana token handling
      return {
        toSignificant: (decimals: number) => parseFloat(amount || '0').toFixed(decimals),
        currency: {
          symbol: asset.token.symbol,
          decimals: asset.token.decimals,
        },
      }
    }

    // Original EVM logic
    // Check if it's native ETH (address is 0x000...)
    const isNativeETH = asset.token.address === '0x0000000000000000000000000000000000000000'

    const currency = isNativeETH
      ? Native.onChain(asset.chainId)
      : new Token(
          asset.chainId,
          asset.token.address as `0x${string}`,
          asset.token.decimals,
          asset.token.symbol,
          asset.token.name,
        )

    return tryParseAmount(amount, currency)
  }, [amount, asset])

  return (
    <Wrapper>
      <Section>
        <ColumnCenter>
          <FlexGap width="100%" alignItems="center" position="relative" mb="16px" gap="8px" flexDirection="column">
            <Box width="100%" style={{ textAlign: 'center' }}>
              <Text fontSize="20px" bold>
                {t('Confirm transaction')}
              </Text>
            </Box>
          </FlexGap>

          <>
            <Box position="relative" mb="16px">
              <CurrencyLogo
                size="80px"
                src={getEnhancedLogoURI(asset.token.address, asset.chainId, asset.token.logoURI)}
                // @ts-ignore
                currency={tokenAmount?.currency}
              />
              <FlexGap
                position="absolute"
                bottom="-4px"
                right="-4px"
                background="background"
                borderRadius="50%"
                width="30px"
                height="30px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                style={{ boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }}
                zIndex={1}
              >
                <img
                  src={`${ASSET_CDN}/web/chains/${asset.chainId}.png`}
                  alt={`${chainName}-logo`}
                  width="100%"
                  height="100%"
                />
              </FlexGap>
            </Box>
            <Text fontSize="32px" bold>
              {parseFloat(amount || '0').toLocaleString(undefined, {
                maximumFractionDigits: 6,
                minimumFractionDigits: 0,
              })}{' '}
              {asset.token.symbol}
            </Text>
            <Text fontSize="16px" color="textSubtle" mb="24px">
              {asset.price?.usd ? `$${(parseFloat(amount || '0') * asset.price.usd).toFixed(2)}` : '-'}
            </Text>
          </>

          <Flex justifyContent="space-between" width="100%" mb="8px" alignItems="flex-start">
            <Text color="textSubtle">{t('To.recipient')}</Text>
            <Box maxWidth="70%" style={{ wordBreak: 'break-all', textAlign: 'right' }}>
              <Text>{recipient}</Text>
            </Box>
          </Flex>

          <Flex justifyContent="space-between" width="100%" mb="8px" alignItems="center">
            <Text color="textSubtle">{t('Network')}</Text>
            <FlexGap alignItems="center" gap="3px">
              <Text ml="4px">
                {chainName} {t('Chain')}
              </Text>
              <ChainLogo chainId={asset.chainId} width={20} height={20} />
            </FlexGap>
          </Flex>

          <Flex justifyContent="space-between" width="100%" mb="24px">
            <Text color="textSubtle">{t('Network Fee')}</Text>
            <Box style={{ textAlign: 'right' }}>
              <Text>{estimatedFee ? `~${parseFloat(estimatedFee).toFixed(8)} ${nativeCurrency.symbol}` : '-'}</Text>
              {estimatedFeeUsd && (
                <Text fontSize="12px" color="textSubtle">
                  ${estimatedFeeUsd} USD
                </Text>
              )}
            </Box>
          </Flex>

          <Button
            onClick={
              isChainMatched
                ? onConfirm
                : async () => {
                    if (asset.chainId === NonEVMChainId.SOLANA) {
                      // Trigger Solana wallet connection
                      try {
                        await connectSolanaWallet()
                      } catch (error) {
                        console.error('Failed to connect Solana wallet:', error)
                      }
                    } else {
                      switchNetwork(asset.chainId)
                    }
                  }
            }
            width="100%"
          >
            {isChainMatched
              ? t('Send')
              : asset.chainId === NonEVMChainId.SOLANA
              ? t('Connect Solana Wallet')
              : t('Switch Network')}
          </Button>
        </ColumnCenter>
      </Section>
    </Wrapper>
  )
}

// Transaction Submitted Screen
export function TransactionSubmittedContent({
  chainId,
  hash,
  onDismiss,
}: {
  onDismiss?: () => void
  hash: string | undefined
  chainId?: UnifiedChainId
}) {
  const { t } = useTranslation()
  const blockExplorerName = useBlockExploreName(chainId as ChainId)
  const getBlockExploreLink = useBlockExploreLink()

  const getExplorerLink = () => {
    if (!chainId || !hash) return undefined

    return getBlockExploreLink(hash, 'transaction', chainId)
  }

  const getExplorerName = () => {
    if (chainId === NonEVMChainId.SOLANA) {
      return blockExplorerName
    }
    return blockExplorerName
  }

  return (
    <Wrapper>
      <Section>
        <ConfirmedIcon>
          <Spinner size={96} />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify="center">
          <Text fontSize="20px">{t('Transaction submitted')}</Text>
          {chainId && hash && (
            <Link external small href={getExplorerLink()}>
              {t('View on %site%', {
                site: getExplorerName(),
              })}
            </Link>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} mt="20px">
              {t('Close')}
            </Button>
          )}
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

// Transaction Completed Screen
export function TransactionCompletedContent({
  chainId,
  hash,
  onDismiss,
  asset,
  amount,
  recipient,
}: {
  onDismiss?: () => void
  hash: string | undefined
  chainId?: UnifiedChainId
  asset: BalanceData
  amount: string
  recipient: string
}) {
  const { t } = useTranslation()
  const blockExplorerName = useBlockExploreName(chainId as ChainId)
  const getBlockExploreLink = useBlockExploreLink()

  const getExplorerLink = () => {
    if (!chainId || !hash) return undefined

    return getBlockExploreLink(hash, 'transaction', chainId)
  }

  const getExplorerName = () => {
    if (chainId === NonEVMChainId.SOLANA) {
      return blockExplorerName
    }
    return blockExplorerName
  }

  return (
    <Wrapper>
      <Section>
        <ConfirmedIcon>
          <CheckmarkCircleIcon color="success" width="90px" />
        </ConfirmedIcon>
        <AutoColumn gap="12px" justify="center">
          <Box>
            <Text fontSize="20px" textAlign="center" bold>
              {t('Transaction completed')}
            </Text>
          </Box>
          <Box background="backgroundAlt" padding="16px" borderRadius="16px" width="100%">
            <Text textAlign="center">
              {amount} {asset.token.symbol} {t('has been sent to')} {recipient.slice(0, 6)}...{recipient.slice(-4)}
            </Text>
          </Box>
          {chainId && hash && (
            <Link external small href={getExplorerLink()}>
              {t('View on %site%', {
                site: getExplorerName(),
              })}
            </Link>
          )}
          {onDismiss && (
            <Button onClick={onDismiss} mt="20px" width="100%">
              {t('Done')}
            </Button>
          )}
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

const SendTransactionContent: React.FC<React.PropsWithChildren<SendTransactionModalProps>> = ({
  asset,
  amount,
  recipient,
  onDismiss,
  txHash,
  attemptingTxn,
  pendingText,
  onConfirm,
  chainId,
  estimatedFee,
  estimatedFeeUsd,
}) => {
  const { t } = useTranslation()

  const handleDismiss = useCallback(() => {
    onDismiss?.()
  }, [onDismiss])

  if (!chainId) return null

  return (
    <Box>
      {attemptingTxn ? (
        <ConfirmationPendingContent pendingText={pendingText || t('Sending tokens')} />
      ) : txHash ? (
        <TransactionCompletedContent
          chainId={chainId}
          hash={txHash}
          onDismiss={handleDismiss}
          asset={asset}
          amount={amount}
          recipient={recipient}
        />
      ) : (
        <ConfirmTransactionContent
          asset={asset}
          amount={amount}
          recipient={recipient}
          onConfirm={onConfirm}
          estimatedFee={estimatedFee}
          estimatedFeeUsd={estimatedFeeUsd}
        />
      )}
    </Box>
  )
}

export default SendTransactionContent
