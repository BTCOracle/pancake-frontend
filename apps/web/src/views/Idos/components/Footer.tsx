import { BscScanIcon, CardBody, FlexGap, LanguageIcon, Link, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { useCurrentIDOConfig } from '../hooks/ido/useCurrentIDOConfig'
import { useIDOContract } from '../hooks/ido/useIDOContract'

export const Footer: React.FC = () => {
  const { theme } = useTheme()
  const idoContract = useIDOContract()
  const currentIdoConfig = useCurrentIDOConfig()
  return (
    <CardBody>
      <FlexGap gap="12px" flexDirection="column">
        <FlexGap gap="12px">
          <Link href={currentIdoConfig?.projectUrl} target="_blank" rel="noopener noreferrer">
            <LanguageIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
          <Link href={`https://bscscan.com/address/${idoContract?.address}`} target="_blank" rel="noopener noreferrer">
            <BscScanIcon width="24px" color={theme.colors.textSubtle} />
          </Link>
        </FlexGap>
        <Text color="textSubtle" fontSize="14px" lineHeight="16.8px">
          {currentIdoConfig?.description}
        </Text>
      </FlexGap>
    </CardBody>
  )
}
