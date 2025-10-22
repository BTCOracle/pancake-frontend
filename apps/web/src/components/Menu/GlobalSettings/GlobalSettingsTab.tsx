import { ChainId } from '@pancakeswap/chains'
import { languageList, useTranslation } from '@pancakeswap/localization'
import { Flex, LangSelectorV2, QuestionHelper, Text, ThemeSwitcher, Toggle } from '@pancakeswap/uikit'
import { TOKEN_RISK } from 'components/AccessRisk'
import AccessRiskTooltips from 'components/AccessRisk/AccessRiskTooltips'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useTheme from 'hooks/useTheme'
import { useWebNotifications } from 'hooks/useWebNotifications'
import { Suspense, lazy } from 'react'
import { useSubgraphHealthIndicatorManager, useUserUsernameVisibility } from 'state/user/hooks'
import { useUserShowTestnet } from 'state/user/hooks/useUserShowTestnet'
import { useUserTokenRisk } from 'state/user/hooks/useUserTokenRisk'
import { styled } from 'styled-components'

const WebNotiToggle = lazy(() => import('./WebNotiToggle'))

const BetaTag = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.success};
  border-radius: 16px;
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 3px;
  padding-bottom: 3px;
  color: ${({ theme }) => theme.colors.success};
  margin-left: 6px;
  font-weight: bold;
  font-size: 14px;
`

export const GlobalSettingsTab = () => {
  const { currentLanguage, setLanguage, t } = useTranslation()

  const { isDark, setTheme } = useTheme()
  const { chainId } = useActiveChainId()
  const { enabled } = useWebNotifications()

  // Global-specific state
  const [subgraphHealth, setSubgraphHealth] = useSubgraphHealthIndicatorManager()
  const [userUsernameVisibility, setUserUsernameVisibility] = useUserUsernameVisibility()
  const [showTestnet, setShowTestnet] = useUserShowTestnet()
  const [tokenRisk, setTokenRisk] = useUserTokenRisk()

  return (
    <Flex pb="24px" flexDirection="column">
      <Flex justifyContent="space-between" mb="24px" alignItems="center">
        <Text>{t('Language')}</Text>
        <LangSelectorV2 currentLang={currentLanguage.code} langs={languageList} setLang={setLanguage} />
      </Flex>

      <Flex justifyContent="space-between" mb="24px">
        <Text>{t('Dark mode')}</Text>
        <ThemeSwitcher isDark={isDark} toggleTheme={() => setTheme(isDark ? 'light' : 'dark')} />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Subgraph Health Indicator')}</Text>
          <QuestionHelper
            text={t(
              'Turn on subgraph health indicator all the time. Default is to show the indicator only when the network is delayed',
            )}
            placement="top"
            ml="4px"
          />
        </Flex>
        <Toggle
          id="toggle-subgraph-health-button"
          checked={subgraphHealth}
          scale="md"
          onChange={() => {
            setSubgraphHealth(!subgraphHealth)
          }}
        />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Show username')}</Text>
          <QuestionHelper text={t('Shows username of wallet instead of bunnies')} placement="top" ml="4px" />
        </Flex>
        <Toggle
          id="toggle-username-visibility"
          checked={userUsernameVisibility}
          scale="md"
          onChange={() => {
            setUserUsernameVisibility(!userUsernameVisibility)
          }}
        />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Allow notifications')}</Text>
          <QuestionHelper
            text={t(
              'Enables the web notifications feature. If turned off you will be automatically unsubscribed and the notification bell will not be visible',
            )}
            placement="top"
            ml="4px"
          />
          <BetaTag>{t('BETA')}</BetaTag>
        </Flex>
        <Suspense fallback={null}>
          <WebNotiToggle enabled={enabled} />
        </Suspense>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Flex alignItems="center">
          <Text>{t('Show testnet')}</Text>
        </Flex>
        <Toggle
          id="toggle-show-testnet"
          checked={showTestnet}
          scale="md"
          onChange={() => {
            setShowTestnet((s) => !s)
          }}
        />
      </Flex>

      {chainId === ChainId.BSC && (
        <>
          <Flex justifyContent="space-between" alignItems="center" mb="24px">
            <Flex alignItems="center">
              <Text>{t('Token Risk Scanning')}</Text>
              <QuestionHelper
                text={
                  <AccessRiskTooltips
                    hasResult
                    riskLevel={TOKEN_RISK.SOME_RISK}
                    riskLevelDescription={t(
                      'Automatic risk scanning for the selected token. This scanning result is for reference only, and should NOT be taken as investment advice.',
                    )}
                  />
                }
                placement="top"
                ml="4px"
              />
            </Flex>
            <Toggle
              id="toggle-token-risk"
              checked={tokenRisk}
              scale="md"
              onChange={() => {
                setTokenRisk(!tokenRisk)
              }}
            />
          </Flex>
        </>
      )}
    </Flex>
  )
}
