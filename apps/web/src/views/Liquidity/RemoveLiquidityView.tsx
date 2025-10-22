import RemoveLiquidityFormProvider from 'views/RemoveLiquidity/form/RemoveLiquidityFormProvider'
import RemoveLiquidity from 'views/RemoveLiquidity/RemoveLiquidityV3'

export const RemoveLiquidityView = () => {
  return (
    <RemoveLiquidityFormProvider>
      <RemoveLiquidity />
    </RemoveLiquidityFormProvider>
  )
}
