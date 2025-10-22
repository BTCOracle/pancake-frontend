import { getIdFromPrice } from './getIdFromPrice'

export const getIdSlippage = (slippagePercentage: number, binStep: number, activeId: number) => {
  return Math.abs(getIdFromPrice(1 + slippagePercentage, binStep) - activeId)
}
