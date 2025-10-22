import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { ReactNode } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { SimpleGrid } from '@chakra-ui/react'
import { PriceRangeInputBox, Side } from '@/features/Create/ClmmPool/components/SetPriceAndRange'

interface Props {
  priceRange: string[]
  decimals: number
  disabled?: boolean
  postfix?: ReactNode
  tokenBase?: ApiV3Token
  tokenQuote?: ApiV3Token
  onLeftBlur: (val: string) => void
  onRightBlur: (val: string) => void
  onInputChange: (val: string, _: number, side?: string) => void
  onClickAdd?: (side: Side, isAdd: boolean) => void
}

export default function RangeInput(props: Props) {
  const { tokenBase, tokenQuote, priceRange, decimals, disabled, onLeftBlur, onRightBlur, onInputChange, onClickAdd } = props
  const { t } = useTranslation()
  return (
    <SimpleGrid gridTemplate="repeat(auto-fill, 1fr)" gridAutoFlow={['row', 'column']} gap={[3, 4]} mb="4">
      <PriceRangeInputBox
        side={Side.Left}
        topLabel={t('Min')}
        disabled={disabled}
        currentPriceRangeValue={priceRange[0]}
        decimals={Math.max(8, decimals)}
        base={tokenBase}
        quote={tokenQuote}
        onAdd={() => onClickAdd?.(Side.Left, true)}
        onMinus={() => onClickAdd?.(Side.Left, false)}
        onInputBlur={onLeftBlur}
        onInputChange={onInputChange}
      />
      <PriceRangeInputBox
        side={Side.Right}
        topLabel={t('Max.upper-bound')}
        disabled={disabled}
        currentPriceRangeValue={priceRange[1]}
        decimals={Math.max(8, decimals)}
        base={tokenBase}
        quote={tokenQuote}
        onAdd={() => onClickAdd?.(Side.Right, true)}
        onMinus={() => onClickAdd?.(Side.Right, false)}
        onInputBlur={onRightBlur}
        onInputChange={onInputChange}
      />
    </SimpleGrid>
  )
}
