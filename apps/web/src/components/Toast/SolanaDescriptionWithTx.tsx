import { useTranslation } from '@pancakeswap/localization'
import { Link, Text } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { solanaExplorerAtom } from '@pancakeswap/utils/user'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

interface DescriptionWithTxProps {
  description?: string
  txHash?: string
}

export const SolanaDescriptionWithTx: React.FC<React.PropsWithChildren<DescriptionWithTxProps>> = ({
  txHash,
  children,
}) => {
  const { t } = useTranslation()
  const explorer = useAtomValue(solanaExplorerAtom)

  const explorerLink = useMemo(() => {
    return `${explorer.host}/tx/${txHash}`
  }, [txHash, explorer.host])

  return (
    <>
      {typeof children === 'string' ? <Text as="p">{children}</Text> : children}
      {txHash && (
        <Link external href={explorerLink}>
          {t('View on %site%', { site: explorer.name })}: {truncateHash(txHash, 8, 0)}
        </Link>
      )}
    </>
  )
}
