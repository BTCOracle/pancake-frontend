import { Currency, SPLToken } from '@pancakeswap/sdk'
import React, { useMemo } from 'react'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { SVMPool } from '@pancakeswap/smart-router'
import { PairNode } from '../PairNode'

export type Pair = [Currency, Currency]

export interface PairNodeProps {
  pair: Pair
  className: string
  poolFee?: number
}

interface Params {
  pairs: Pair[]
  pools: SVMPool[]
}

function SolanaPairNode({ pair, className, poolFee }: PairNodeProps) {
  const [input, output] = pair as [SPLToken, SPLToken]

  // why need to use useUnifiedCurrency here?
  // Because Jupiter only return token adddress,
  // so when we convert it in parseSVMTradeIntoSVMOrder,
  // we only have token address, no other info.
  // so we need to use useUnifiedCurrency to get actual token info.
  const inputCurrency = useUnifiedCurrency(input.address, input.chainId)
  const outputCurrency = useUnifiedCurrency(output.address, output.chainId)

  const tooltipText = `${inputCurrency?.symbol}/${outputCurrency?.symbol} ${poolFee ? `(${poolFee}%)` : ''}`
  // show fee only
  const text = poolFee ? `${poolFee}%` : ''

  const slpTokenPair: Pair | undefined = useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return undefined
    }
    return [inputCurrency, outputCurrency] as Pair
  }, [inputCurrency, outputCurrency])

  if (!slpTokenPair) {
    return null
  }

  return <PairNode pair={slpTokenPair} text={text} className={className} tooltipText={tooltipText} />
}

export function JupPairNodes({ pairs, pools }: Params): React.ReactNode[] | null {
  const isMatchLength = pairs?.length === pools?.length

  return pairs.length > 0
    ? pairs.map((p, index) => {
        return (
          <SolanaPairNode
            pair={p}
            poolFee={isMatchLength ? pools[0].fee : undefined}
            className="highlight"
            key={index}
          />
        )
      })
    : null
}
