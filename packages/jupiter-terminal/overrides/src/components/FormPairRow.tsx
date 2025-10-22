import { TokenInfo } from '@solana/spl-token-registry'
import Decimal from 'decimal.js'
import React, { CSSProperties, useEffect, useMemo, useRef } from 'react'
import { WRAPPED_SOL_MINT } from 'src/constants'
import { useAccounts } from 'src/contexts/accounts'
import { checkIsStrictOrVerified, checkIsToken2022 } from 'src/misc/tokenTags'
import { formatNumber, hasNumericValue } from 'src/misc/utils'
import CheckedBadge from './CheckedBadge'
import CoinBalance from './Coinbalance'
import { useLstApyFetcher } from './SuggestionTags/hooks/useLstApy'
import TokenIcon from './TokenIcon'
import TokenLink from './TokenLink'

export const PAIR_ROW_HEIGHT = 72

export interface IPairRow {
  usdValue?: Decimal
  item: TokenInfo
  style: CSSProperties
  onSubmit(item: TokenInfo): void
  suppressCloseModal?: boolean
  showExplorer?: boolean
  tokenList?: TokenInfo[]
  enableUnknownTokenWarning?: boolean
  isLST?: boolean
}

interface IMultiTag {
  isVerified: boolean
  isLST: boolean
  // isUnknown: boolean;
  isToken2022: boolean
  isFrozen: boolean
}

const LSTTag: React.FC<{ mintAddress: string }> = ({ mintAddress }) => {
  const { data: lstApy } = useLstApyFetcher()

  const apy = useMemo(() => {
    if (!lstApy) return

    const value = lstApy.apys[mintAddress]
    if (value && hasNumericValue(value)) {
      return new Decimal(value).mul(100).toDP(2).toString()
    }
    return
  }, [lstApy, mintAddress])

  return (
    <p className="rounded-md text-xxs leading-none transition-all py-0.5 px-1 border border-v3-primary/50 font-semibold">
      LST {apy ? `${apy}%` : ''}
    </p>
  )
}

const MultiTags: React.FC<IPairRow> = ({ item }) => {
  const { accounts } = useAccounts()
  const isLoading = useRef<boolean>(false)
  const isLoaded = useRef<boolean>(false)
  // It's cheaper to slightly delay and rendering once, than rendering everything all the time
  const [renderedTag, setRenderedTag] = React.useState<IMultiTag>({
    isVerified: false,
    isLST: false,
    // isUnknown: false,
    isToken2022: false,
    isFrozen: false,
  })

  useEffect(() => {
    if (isLoaded.current || isLoading.current) return

    isLoading.current = true
    setTimeout(() => {
      const result = {
        isVerified: checkIsStrictOrVerified(item),
        isLST: Boolean(item.tags?.includes('lst')),
        // isUnknown: checkIsUnknownToken(item),
        isToken2022: Boolean(checkIsToken2022(item)),
        isFrozen: accounts[item.address]?.isFrozen || false,
      }
      setRenderedTag(result)
      isLoading.current = false
      isLoaded.current = true
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remainingTags: string[] = [] // we use to show 'pump'

  if (!renderedTag) return null

  const { isToken2022, isFrozen, isLST } = renderedTag

  return (
    <div className="flex justify-end gap-x-1">
      {isFrozen && (
        <p className="border rounded-md text-xxs leading-none transition-all py-0.5 px-1 border-warning/50 text-warning/50">
          Frozen
        </p>
      )}

      {isToken2022 && (
        <p className="rounded-md text-xxs leading-none transition-all py-0.5 px-1 bg-black/10 font-semibold">
          Token2022
        </p>
      )}
      {remainingTags?.map((tag, idx) => (
        <div
          key={idx}
          className="rounded-md text-xxs leading-none transition-all py-0.5 px-1 bg-black/10 font-semibold"
        >
          {tag}
        </div>
      ))}

      {isLST && <LSTTag mintAddress={item.address} />}
    </div>
  )
}

const FormPairRow = (props: IPairRow) => {
  const {
    item,
    style,
    onSubmit,
    tokenList,
    suppressCloseModal,
    usdValue,
    showExplorer = true,
    enableUnknownTokenWarning = true,
  } = props
  const token = useMemo(() => {
    if (!tokenList) return item
    return tokenList.find((t) => t.address === item.address) || item
  }, [item, tokenList])
  const onClick = React.useCallback(() => {
    onSubmit(item)

    if (suppressCloseModal) return
  }, [onSubmit, item, suppressCloseModal])

  const usdValueDisplay =
    usdValue && usdValue.gte(0.01) // If smaller than 0.01 cents, dont show
      ? `$${formatNumber.format(usdValue, 2)}` // USD value can hardcode to 2
      : ''

  return (
    <li
      className={`rounded cursor-pointer px-5 my-1 list-none flex w-full items-center `}
      style={{ maxHeight: PAIR_ROW_HEIGHT - 4, height: PAIR_ROW_HEIGHT - 4, ...style }}
      onClick={onClick}
      translate="no"
    >
      <div className="flex h-full w-full items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="rounded-full">
            <TokenIcon
              info={token}
              width={36}
              height={36}
              enableUnknownTokenWarning={!!token.programId ? false : enableUnknownTokenWarning}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-y-px">
            <div className="flex items-center">
              <p className="text-sm font-medium truncate pcs-pair-row-symbol">{item.symbol}</p>

              {checkIsStrictOrVerified(item) && (
                <p className="rounded-md text-xxs leading-none transition-all py-0.5 px-1">
                  <CheckedBadge width={18} height={18} />
                </p>
              )}
            </div>

            <p className="text-xs truncate pcs-pair-row-name">
              {item.address === WRAPPED_SOL_MINT.toBase58() ? 'Solana' : item.name}
            </p>

            {/* Intentionally higher z to be clickable */}
            {showExplorer ? (
              <div className="-ml-1 z-10 w-fit" onClick={(e) => e.stopPropagation()}>
                <TokenLink tokenInfo={item} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="text-xs text-right h-full flex flex-col justify-evenly">
          <CoinBalance mintAddress={item.address} hideZeroBalance />
          {usdValueDisplay ? <p>{usdValueDisplay}</p> : null}
          <MultiTags {...props} />
        </div>
      </div>
    </li>
  )
}

export default FormPairRow
