import { ApprovalState, useApproveCallbackFromAmount } from 'hooks/useApproveCallback'
import { useAtomValue } from 'jotai'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { inputCurrencyAtom } from '../state/currency/currencyAtoms'
import { parsedAmountsAtom } from '../state/form/inputAtoms'
import { Field } from '../types/limitOrder.types'

export const useLimitOrderApproval = () => {
  const contract = useCLLimitOrderHookContract()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const parsedAmounts = useAtomValue(parsedAmountsAtom)

  const { approveCallback, approvalState } = useApproveCallbackFromAmount({
    token: inputCurrency?.isToken ? inputCurrency : undefined,
    minAmount: parsedAmounts[Field.CURRENCY_A],
    targetAmount: parsedAmounts[Field.CURRENCY_A],
    spender: contract?.address,
    addToTransaction: true,
  })

  return {
    approveCallback,
    approvalState: inputCurrency?.isNative ? ApprovalState.APPROVED : approvalState,
  }
}
