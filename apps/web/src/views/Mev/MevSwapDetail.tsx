import { useTranslation } from '@pancakeswap/localization'
import { QuestionHelperV2, ShieldCheckIcon, Text } from '@pancakeswap/uikit'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import { useIsMEVEnabled } from './hooks'

const Wrapper = styled.div`
  background-color: ${({ theme }) => (theme.isDark ? '#323037' : '#F7F7F7')};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 12px 16px;
  margin-top: 8px;
`

export const MevSwapDetail: React.FC = () => {
  const { t } = useTranslation()
  const { isMEVEnabled, isLoading } = useIsMEVEnabled()
  const { theme } = useTheme()
  if (!isMEVEnabled || isLoading) {
    return null
  }

  return (
    <Wrapper>
      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={t(
              'PancakeSwap MEV Guard protects you from frontrunning and sandwich attacks when swapping on BNB Chain.',
            )}
            placement="top-start"
          >
            <ShieldCheckIcon width="15px" color="success" />
            <Text
              fontSize="14px"
              bold
              style={{
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textDecorationColor: theme.colors.textSubtle,
                textUnderlineOffset: '4px',
                cursor: 'pointer',
              }}
              ml="7px"
              lineHeight="150%"
            >
              {t('MEV Protected')}
            </Text>
          </QuestionHelperV2>
        </RowFixed>
      </RowBetween>
    </Wrapper>
  )
}
