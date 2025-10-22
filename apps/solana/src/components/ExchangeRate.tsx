import { TokenInfo, Price } from '@pancakeswap/solana-core-sdk'

interface Props {
  tokenInput: TokenInfo
  tokenOutput: TokenInfo
  executionPrice?: Price
}

export default function ExchangeRate(props: Props) {
  const { tokenInput, tokenOutput, executionPrice } = props
  if (!executionPrice || executionPrice?.raw.isZero()) return null
  return (
    <div>
      1 {tokenInput.symbol} ≈ {executionPrice.toFixed()} <br />1 {tokenOutput.symbol} ≈ {executionPrice.invert().toFixed()}
    </div>
  )
}
