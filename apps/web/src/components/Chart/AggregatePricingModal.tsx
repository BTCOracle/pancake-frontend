import { Box, Modal, ModalV2, Text, useModalV2 } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { styled } from 'styled-components'

const ContentContainer = styled(Box)`
  padding: 24px;
  max-width: 480px;
`

interface AggregatePricingModalProps {
  children: React.ReactNode
}

export const AggregatePricingModal = ({ children }: AggregatePricingModalProps) => {
  const { t } = useTranslation()
  const modalV2Props = useModalV2()

  return (
    <>
      <button
        type="button"
        onClick={modalV2Props.onOpen}
        style={{ cursor: 'pointer', border: 'none', background: 'none' }}
      >
        {children}
      </button>
      <ModalV2 {...modalV2Props} closeOnOverlayClick>
        <Modal title={t('Chart Information')} maxWidth="520px" onDismiss={modalV2Props.onDismiss}>
          <ContentContainer>
            <Box mb="16px">
              <Text fontSize="14px" color="text">
                {t(
                  'This chart shows aggregated price data from multiple sources. Actual output amounts for a swap request or prices from a specific PancakeSwap pool may differ.',
                )}
              </Text>
            </Box>
            <Text fontSize="12px" color="textSubtle">
              {t('The price data displayed is for reference only and may not reflect exact trading prices.')}
            </Text>
          </ContentContainer>
        </Modal>
      </ModalV2>
    </>
  )
}

export default AggregatePricingModal
