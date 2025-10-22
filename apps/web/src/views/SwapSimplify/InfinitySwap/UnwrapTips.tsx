import React, { useCallback } from 'react'
import { Button, FlexGap, InfoIcon, Text, useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { useWallet } from '@solana/wallet-adapter-react'
import { createCloseAccountInstruction } from '@solana/spl-token-0.4'
import { Transaction } from '@solana/web3.js'
import { useSolanaTokenBalance, useRefreshSolanaTokenBalances } from 'state/token/solanaTokenBalances'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { isSolana } from '@pancakeswap/chains'
import { WSOLMint } from '@pancakeswap/sdk'

export const UnwrapTips: React.FC = () => {
  const { t } = useTranslation()
  const { publicKey, signTransaction } = useWallet()
  const connection = useSolanaConnectionWithRpcAtom()
  const { solanaAccount, chainId } = useAccountActiveChain()
  const { balance: wsolBalance } = useSolanaTokenBalance(solanaAccount, WSOLMint.toBase58())
  const refreshSolanaBalances = useRefreshSolanaTokenBalances(solanaAccount)
  const { toastSuccess, toastError } = useToast()

  const showUnwrapTip = isSolana(chainId) && wsolBalance.gt(0)

  const handleUnwrap = useCallback(async () => {
    try {
      if (!publicKey || !signTransaction) throw new Error('Wallet not connected')
      const accounts = await connection.getTokenAccountsByOwner(publicKey, { mint: WSOLMint })
      if (accounts.value.length === 0) return
      const tx = new Transaction()
      accounts.value.forEach(({ pubkey }) => {
        tx.add(createCloseAccountInstruction(pubkey, publicKey, publicKey))
      })
      tx.feePayer = publicKey
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      const signed = await signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(sig)
      toastSuccess(t('Success!'), t('Unwrapped WSOL to SOL'))
      setTimeout(refreshSolanaBalances, 3000)
    } catch (e: any) {
      toastError(t('Failed'), e?.message ?? 'Unwrap failed')
    }
  }, [publicKey, signTransaction, connection, toastSuccess, toastError, t, refreshSolanaBalances])

  if (!showUnwrapTip) return null

  return (
    <FlexGap alignItems="center" gap="4px">
      <InfoIcon width="16px" height="16px" />
      <Text fontSize="12px">
        {t('You have %amount% WSOL that you can ', { amount: wsolBalance.dividedBy(1e9).toFixed(6) })}
      </Text>
      <Button scale="xs" variant="textPrimary60" pl="0px" onClick={handleUnwrap}>
        {t('unwrap')}
      </Button>
    </FlexGap>
  )
}

export default UnwrapTips
