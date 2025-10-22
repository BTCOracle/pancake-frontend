import { MouseEvent, useCallback, useEffect, useMemo } from 'react'
import { NumberFormatValues, NumericFormat } from 'react-number-format'

import { useAccounts } from '../contexts/accounts'

import { MAX_INPUT_LIMIT, MINIMUM_SOL_BALANCE } from '../misc/constants'

import CoinBalance from './Coinbalance'
import FormError from './FormError'
import JupButton from './JupButton'

import TokenIcon from './TokenIcon'

import { UnifiedWalletButton } from '@jup-ag/wallet-adapter'
import Decimal from 'decimal.js'
import { useSwapContext } from 'src/contexts/SwapContext'
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider'
import ChevronDownIcon from 'src/icons/ChevronDownIcon'
import { RoutesSVG } from 'src/icons/RoutesSVG'
import WalletIcon from 'src/icons/WalletIcon'
import { cn } from 'src/misc/cn'
import { detectedSeparator } from 'src/misc/utils'
import { WRAPPED_SOL_MINT } from '../constants'
import { useTokenList } from '../queries/useTokenlist'
import { CoinBalanceUSD } from './CoinBalanceUSD'
import PriceInfo from './PriceInfo/index'
import SuggestionTags from './SuggestionTags'
import { useSuggestionTags } from './SuggestionTags/hooks/useSuggestionTags'
import SwitchPairButton from './SwitchPairButton'
import useTimeDiff from './useTimeDiff/useTimeDiff'

const Form: React.FC<{
  onSubmit: () => void
  isDisabled: boolean
  setSelectPairSelector: React.Dispatch<React.SetStateAction<'fromMint' | 'toMint' | null>>
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ onSubmit, isDisabled, setSelectPairSelector, setIsWalletModalOpen }) => {
  const { publicKey } = useWalletPassThrough()
  const { accounts, nativeAccount } = useAccounts()
  const {
    form,
    setForm,
    errors,
    fromTokenInfo,
    toTokenInfo,
    quoteResponseMeta,
    formProps: { fixedAmount, fixedInputMint, fixedOutputMint },
    loading,
    refresh,
    quoteError,
  } = useSwapContext()
  const { tokenList } = useTokenList()
  const fromTokenInfoFromList = useMemo(() => {
    if (!tokenList || !fromTokenInfo) return fromTokenInfo
    const tokenInfo = tokenList.find((token) => token.address === fromTokenInfo?.address)
    fromTokenInfo.logoURI = tokenInfo?.logoURI || fromTokenInfo?.logoURI
    fromTokenInfo.programId = tokenInfo?.programId
    return fromTokenInfo
  }, [fromTokenInfo, tokenList])
  const toTokenInfoFromList = useMemo(() => {
    if (!tokenList || !toTokenInfo) return toTokenInfo
    const tokenInfo = tokenList.find((token) => token.address === toTokenInfo?.address)
    toTokenInfo.logoURI = tokenInfo?.logoURI || toTokenInfo.logoURI
    toTokenInfo.programId = tokenInfo?.programId
    return toTokenInfo
  }, [toTokenInfo, tokenList])
  const [hasExpired, timeDiff] = useTimeDiff()

  useEffect(() => {
    if (hasExpired) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasExpired])

  const walletPublicKey = useMemo(() => publicKey?.toString(), [publicKey])

  const listOfSuggestions = useSuggestionTags({
    fromTokenInfo: fromTokenInfoFromList?.programId ? undefined : fromTokenInfoFromList,
    toTokenInfo: toTokenInfoFromList?.programId ? undefined : toTokenInfoFromList,
    quoteResponse: quoteResponseMeta?.quoteResponse,
  })

  const onChangeFromValue = ({ value, floatValue, formattedValue }: NumberFormatValues) => {
    if (value === '' || !floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }))
      return
    }

    const isInvalid = Number.isNaN(value)
    if (isInvalid) return

    setForm((form) => ({ ...form, fromValue: value }))
  }

  const onChangeToValue = ({ value, floatValue, formattedValue }: NumberFormatValues) => {
    if (value === '' || !floatValue) {
      setForm((form) => ({ ...form, fromValue: '', toValue: '' }))
      return
    }

    const isInvalid = Number.isNaN(value)
    if (isInvalid) return

    setForm((form) => ({ ...form, toValue: value }))
  }

  const balance: string | null = useMemo(() => {
    if (!fromTokenInfo?.address) return null

    const accBalanceObj =
      fromTokenInfo?.address === WRAPPED_SOL_MINT.toString() ? nativeAccount : accounts[fromTokenInfo.address]
    if (!accBalanceObj) return ''

    return accBalanceObj.balance
  }, [accounts, fromTokenInfo?.address, nativeAccount])

  const onClickMax = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()

      if (!balance) return
      if (fromTokenInfo?.address === WRAPPED_SOL_MINT.toBase58()) {
        setForm((prev) => ({
          ...prev,
          fromValue: new Decimal(balance).gt(MINIMUM_SOL_BALANCE)
            ? new Decimal(balance).minus(MINIMUM_SOL_BALANCE).toFixed(9)
            : '0',
        }))
      } else {
        setForm((prev) => ({
          ...prev,
          fromValue: balance,
        }))
      }
    },
    [balance, fromTokenInfo?.address, setForm],
  )

  const onClickSwitchPair = () => {
    setForm((prev) => ({
      ...prev,
      fromValue: '',
      toValue: '',
      fromMint: prev.toMint,
      toMint: prev.fromMint,
    }))
  }

  const hasFixedMint = useMemo(() => fixedInputMint || fixedOutputMint, [fixedInputMint, fixedOutputMint])
  const { inputAmountDisabled } = useMemo(() => {
    const result = { inputAmountDisabled: true, outputAmountDisabled: true }
    if (!fixedAmount) {
      result.inputAmountDisabled = false
    }
    return result
  }, [fixedAmount])

  const onClickSelectFromMint = useCallback(() => {
    if (fixedInputMint) return
    setSelectPairSelector('fromMint')
  }, [fixedInputMint, setSelectPairSelector])

  const onClickSelectToMint = useCallback(() => {
    if (fixedOutputMint) return
    setSelectPairSelector('toMint')
  }, [fixedOutputMint, setSelectPairSelector])

  const thousandSeparator = useMemo(() => (detectedSeparator === ',' ? '.' : ','), [])
  // Allow empty input, and input lower than max limit
  const withValueLimit = useCallback(
    ({ floatValue }: NumberFormatValues) => !floatValue || floatValue <= MAX_INPUT_LIMIT,
    [],
  )

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (window.Jupiter.enableWalletPassthrough && window.Jupiter.onRequestConnectWallet) {
        window.Jupiter.onRequestConnectWallet()
      } else {
        setIsWalletModalOpen(true)
      }
    },
    [setIsWalletModalOpen],
  )

  return (
    <div className="h-full flex flex-col items-center justify-center pb-4">
      <div className="w-full mt-2 rounded-xl flex flex-col px-2">
        <div className="flex-col">
          <div className={cn('border-b border-transparent bg-v3-input-background rounded-xl transition-all pcs-card')}>
            <div className={cn('px-x border-transparent rounded-xl')}>
              <div>
                <div
                  className={cn(
                    'py-5 px-4 flex flex-col border border-transparent',
                    'group focus-within:border-v3-primary/50 focus-within:shadow-swap-input-dark rounded-xl',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center pcs-currency-btn"
                      disabled={fixedInputMint}
                      onClick={onClickSelectFromMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon
                          info={fromTokenInfoFromList}
                          width={20}
                          height={20}
                          enableUnknownTokenWarning={fromTokenInfoFromList?.programId ? false : true}
                        />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {fromTokenInfo?.symbol}
                      </div>
                      {fixedInputMint ? null : (
                        <span className="fill-current pcs-chevron-down-icon">
                          <ChevronDownIcon />
                        </span>
                      )}
                    </button>

                    <div className="text-right">
                      {fromTokenInfo?.decimals && (
                        <NumericFormat
                          disabled={fixedAmount}
                          value={typeof form.fromValue === 'undefined' ? '' : form.fromValue}
                          decimalScale={fromTokenInfo.decimals}
                          thousandSeparator={thousandSeparator}
                          allowNegative={false}
                          valueIsNumericString
                          onValueChange={onChangeFromValue}
                          placeholder={'0.00'}
                          className={cn('h-full w-full bg-transparent text-right text-lg pcs-numeric-input', {
                            'cursor-not-allowed': inputAmountDisabled,
                          })}
                          decimalSeparator={detectedSeparator}
                          isAllowed={withValueLimit}
                        />
                      )}
                    </div>
                  </div>

                  {fromTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div
                        className={cn('flex mt-3 space-x-1 text-xs items-center cursor-pointer pcs-token-info-wrapper')}
                        onClick={(e) => {
                          onClickMax(e)
                        }}
                      >
                        <WalletIcon className="wallet-icon" width={10} height={10} />
                        <CoinBalance mintAddress={fromTokenInfo.address} />
                        <span>{fromTokenInfo.symbol}</span>
                      </div>

                      {form.fromValue ? (
                        <span className="text-xs">
                          <CoinBalanceUSD tokenInfo={fromTokenInfo} amount={form.fromValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className={'my-2'}>
            {hasFixedMint ? null : (
              <SwitchPairButton onClick={onClickSwitchPair} className={cn('transition-all pcs-switch-btn')} />
            )}
          </div>

          <div className="border-b border-transparent bg-v3-input-background rounded-xl pcs-card">
            <div className="px-x border-transparent rounded-xl">
              <div>
                <div
                  className={cn(
                    'py-5 px-4 flex flex-col border border-transparent',
                    'group focus-within:border-v3-primary/50 focus-within:shadow-swap-input-dark rounded-xl',
                  )}
                >
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="py-2 px-3 rounded-2xl flex items-center disabled:hover:bg-[#1A2633] pcs-currency-btn"
                      disabled={fixedOutputMint}
                      onClick={onClickSelectToMint}
                    >
                      <div className="h-5 w-5">
                        <TokenIcon
                          info={toTokenInfoFromList}
                          width={20}
                          height={20}
                          enableUnknownTokenWarning={toTokenInfoFromList?.programId ? false : true}
                        />
                      </div>
                      <div className="ml-4 mr-2 font-semibold" translate="no">
                        {toTokenInfo?.symbol}
                      </div>

                      {fixedOutputMint ? null : (
                        <span className="fill-current pcs-chevron-down-icon">
                          <ChevronDownIcon />
                        </span>
                      )}
                    </button>

                    <div className="text-right">
                      {toTokenInfo?.decimals && (
                        <NumericFormat
                          disabled={true}
                          value={typeof form.toValue === 'undefined' ? '' : form.toValue}
                          decimalScale={toTokenInfo.decimals}
                          thousandSeparator={thousandSeparator}
                          allowNegative={false}
                          valueIsNumericString
                          onValueChange={onChangeToValue}
                          className={cn(
                            'h-full w-full bg-transparent text-right placeholder:text-sm placeholder:font-normal placeholder:text-v2-lily/20 text-lg pcs-numeric-input',
                          )}
                          decimalSeparator={detectedSeparator}
                          isAllowed={withValueLimit}
                          onKeyDown={(e) => {
                            if (
                              e.metaKey ||
                              e.ctrlKey ||
                              e.key === 'Meta' ||
                              e.key === 'Control' ||
                              e.key === 'Alt' ||
                              e.key === 'Shift'
                            )
                              return
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {toTokenInfo?.address ? (
                    <div className="flex justify-between items-center">
                      <div className="flex mt-3 space-x-1 text-xs items-center pcs-token-info-wrapper">
                        <WalletIcon width={10} height={10} />
                        <CoinBalance mintAddress={toTokenInfo.address} />
                        <span>{toTokenInfo.symbol}</span>
                      </div>

                      {form.toValue ? (
                        <span className="text-xs">
                          <CoinBalanceUSD tokenInfo={toTokenInfo} amount={form.toValue} />
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {quoteResponseMeta ? (
            <div className="flex items-center mt-2 text-xs space-x-1 pcs-quote-meta">
              <div className="rounded-xl flex items-center">
                <RoutesSVG width={7} height={9} />
              </div>
              <span className="">Ultra Swap</span>
            </div>
          ) : null}
        </div>

        <SuggestionTags loading={loading} listOfSuggestions={listOfSuggestions} />

        {walletPublicKey ? <FormError errors={errors} /> : null}
      </div>

      <div className="w-full px-2">
        {!walletPublicKey ? (
          <UnifiedWalletButton
            buttonClassName="!bg-transparent"
            overrideContent={
              <JupButton
                size="lg"
                className="w-full mt-4"
                bgClass="pcs-submit-button"
                type="button"
                onClick={handleClick}
              >
                Connect Wallet
              </JupButton>
            }
          />
        ) : (
          <JupButton
            size="lg"
            className={cn('w-full mt-4 leading-none !max-h-14 ')}
            bgClass="pcs-submit-button"
            type="button"
            onClick={onSubmit}
            disabled={isDisabled || loading}
          >
            {loading ? (
              <span className="text-sm">Loading...</span>
            ) : quoteError ? (
              <span className="text-sm">Error fetching route. Try changing your input</span>
            ) : (
              <span>Swap</span>
            )}
          </JupButton>
        )}

        {quoteResponseMeta && fromTokenInfo && toTokenInfo ? (
          <PriceInfo
            quoteResponse={quoteResponseMeta}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
            loading={loading}
          />
        ) : null}
      </div>
    </div>
  )
}

export default Form
