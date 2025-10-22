import { Text, WarningIcon } from '@pancakeswap/uikit'

export const ErrorMessage = ({ message }: { message: string }) => (
  <Text bold color="failure">
    <WarningIcon width="16px" color="failure" style={{ verticalAlign: 'middle', display: 'inline' }} /> {message}
  </Text>
)
