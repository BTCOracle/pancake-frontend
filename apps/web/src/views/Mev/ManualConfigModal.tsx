import { useTranslation } from '@pancakeswap/localization'
import {
  Card,
  CopyIcon,
  copyText,
  FlexGap,
  LinkExternal,
  Message,
  MessageText,
  ModalBody,
  Text,
  useMatchBreakpoints,
} from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { rpcData, walletConfig } from './constant'
import { getImageUrl } from './utils'

const UnderLineBox = styled.div`
  position: relative;
  flex-grow: 1;
  height: 100%;
  &::before {
    content: '';
    position: absolute;
    height: 100%;
    top: 0px;
    left: 0;
    width: 100%;
    border-bottom: 1px dotted ${({ theme }) => theme.colors.cardBorder};
  }
`

export const ManualConfigModal: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile, isMd, isXs } = useMatchBreakpoints()
  return (
    <ModalBody maxWidth={isMobile || isMd ? '100%' : '440px'} p={isMobile ? '16px' : '24px'}>
      <FlexGap gap="24px" flexDirection="column" alignItems="center">
        <Text textAlign="center">
          <Text as="span" bold pr="4px">
            {t('PancakeSwap MEV Guard')}
          </Text>
          {t('requires a manual configuration for your wallet. Choose your wallet to view a detailed guide:')}
        </Text>
        <FlexGap width="100%" flexWrap="nowrap" alignItems="center" justifyContent="space-around">
          {walletConfig.map((wallet) => (
            <FlexGap
              flexDirection="column"
              alignItems="center"
              gap="8px"
              onClick={() => {
                window.open(wallet.doc, '_blank', 'noopener noreferrer')
              }}
              style={{ cursor: 'pointer' }}
            >
              <img src={getImageUrl(wallet.image)} alt={wallet.title} width="36px" />
              <Text fontSize="12px" lineHeight="15px" bold color="#02919D">
                {t(wallet.title)}
              </Text>
            </FlexGap>
          ))}
        </FlexGap>
        <Card innerCardProps={{ p: '16px' }}>
          <Text fontSize={isMobile ? '14px' : '20px'} bold mb="16px">
            {t('Or add manually this RPC endpoint to your wallet')}
          </Text>
          <FlexGap gap="8px" flexDirection="column">
            {Object.entries(rpcData).map(([key, value]) => (
              <FlexGap gap="8px" alignItems="center" key={key} flexWrap="nowrap">
                <Text style={{ whiteSpace: 'nowrap' }} fontSize={isMobile ? '12px' : '14px'}>
                  {key}:
                </Text>
                <UnderLineBox />
                <Text bold fontSize={isMobile ? '12px' : '14px'}>
                  {value}
                </Text>
                <CopyIcon
                  width={isMobile ? (isXs ? '14px' : '16px') : '20px'}
                  cursor="pointer"
                  color="#02919D"
                  onClick={() => copyText(value)}
                />
              </FlexGap>
            ))}
          </FlexGap>
        </Card>

        <Message variant="success">
          <FlexGap gap="8px" flexDirection="column" alignItems="flex-start">
            <MessageText>
              {t(`If you've already set this up manually, no action is needed - just proceed with the swap!`)}
            </MessageText>
            <LinkExternal href="/mev">{t('Learn more')}</LinkExternal>
          </FlexGap>
        </Message>
      </FlexGap>
    </ModalBody>
  )
}
