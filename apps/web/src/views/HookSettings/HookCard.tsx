import { HookData } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, Flex, FlexGap, GithubIcon, ScanLink, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { truncateText } from 'utils'

import { HookTags } from './HookTags'

const StyledHookCard = styled(Box)`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii['20px']};

  &:first-of-type {
    margin-top: 140px;
  }

  &:only-of-type {
    margin-top: 0;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    &:first-of-type {
      margin-top: 0;
    }
  }
`

interface HookCardProps {
  onClick?: () => void
  hookData: HookData
}

export const HookCard = ({ onClick, hookData }: HookCardProps) => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <StyledHookCard>
      <Flex justifyContent="space-between" flexDirection={['column', 'column', 'row']}>
        <Text bold> {hookData.name} </Text>
        <FlexGap gap="5px" mt={['10px', '10px', '0']} flexWrap="wrap">
          <HookTags hook={hookData} />
        </FlexGap>
      </Flex>

      <FlexGap mt="16px" justifyContent="space-between" gap="12px">
        <Box maxWidth="70%">
          <Text color="textSubtle" small style={{ lineBreak: 'auto' }}>
            {truncateText(hookData.description, isMobile ? 100 : 220)}
          </Text>
        </Box>

        <Box>
          <Button onClick={onClick}> {t('Select')} </Button>
        </Box>
      </FlexGap>

      <FlexGap mt="16px" gap="5px" alignItems="center" justifyContent={isMobile ? 'space-between' : 'normal'}>
        <ScanLink href={hookData.github} small icon={<GithubIcon width="16px" />} style={{ cursor: 'pointer' }}>
          {t('Learn More')}
        </ScanLink>
      </FlexGap>
    </StyledHookCard>
  )
}
