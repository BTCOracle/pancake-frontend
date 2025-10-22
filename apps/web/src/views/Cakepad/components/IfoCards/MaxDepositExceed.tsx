import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, Text, ErrorIcon } from '@pancakeswap/uikit'

interface MaxDepositExceedProps {
  show: boolean
}

const MaxDepositExceed: React.FC<MaxDepositExceedProps> = ({ show }) => {
  const { t } = useTranslation()
  if (!show) return null
  return (
    <FlexGap alignItems="center" background="failure33" borderRadius="8px" padding="12px" color="failure">
      <ErrorIcon width="16px" color="failure" />
      <Text fontSize="12px" color="failure">
        {t('Amount exceeds max deposit')}
      </Text>
    </FlexGap>
  )
}

export default MaxDepositExceed
