import { useTranslation } from '@pancakeswap/localization'
import { Flex, LogoWithTextIcon } from '@pancakeswap/uikit'
import ConnectW3WButton, { DisconnectW3WButton } from 'components/ConnectW3WButton'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import Hero from './components/Hero'

export const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 16px;
  min-height: 100vh;
`

const WidthWrapper = styled.div`
  max-width: 450px;
  margin: 0 auto;
`

export const IdoPageLayout = ({ children }) => {
  const { address } = useAccount()
  const { t } = useTranslation()

  return (
    <>
      <Flex px="16px" py="11.5px" justifyContent="space-between">
        <LogoWithTextIcon height="30px" width="130px" />
        {address ? <DisconnectW3WButton scale="sm" /> : <ConnectW3WButton scale="sm">{t('Connect')}</ConnectW3WButton>}
      </Flex>
      <Wrapper>
        <WidthWrapper>
          <Hero />
          {children}
        </WidthWrapper>
      </Wrapper>
    </>
  )
}
