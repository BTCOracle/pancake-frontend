import { Box, Button, Flex, VStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { Checkbox, ModalV2, MotionModal, Text, useMatchBreakpoints, useModalV2 } from '@pancakeswap/uikit'
import { useEffect, useState } from 'react'
import { setStorageItem } from '@/utils/localStorage'
import { colors } from '@/theme/cssVariables'

const DISCLAIMER_KEY = '_r_have_agreed_disclaimer_'

function DisclaimerModal() {
  const { t } = useTranslation()
  const { isOpen, setIsOpen, onDismiss } = useModalV2()
  const [userHaveAgree, setUserHaveAgree] = useState(true)
  const { isMobile } = useMatchBreakpoints()

  const confirmDisclaimer = () => {
    setStorageItem(DISCLAIMER_KEY, 1)
    onDismiss()
  }

  useEffect(() => {
    // const haveAgreedDisclaimer = getStorageItem(DISCLAIMER_KEY)
    const haveAgreedDisclaimer = '1'
    if (!haveAgreedDisclaimer || haveAgreedDisclaimer !== '1') {
      setIsOpen(true)
    }
  }, [setIsOpen])

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <MotionModal
        title={t('Disclaimer')}
        onDismiss={onDismiss}
        minWidth={[null, null, '370px']}
        maxWidth={['100%', '100%', '370px']}
        minHeight={isMobile ? '500px' : undefined}
        headerPadding="2px 14px 0 24px"
      >
        <VStack spacing={6}>
          <Box bgColor={colors.background} p={6} m="-6" mb={0}>
            <Box
              bgColor={colors.backgroundAlt}
              borderColor={colors.cardBorder01}
              borderWidth="1px"
              borderStyle="solid"
              rounded="3xl"
              flex="1"
              p="4"
              overflowY="auto"
              maxH={{ base: '20rem', md: '28rem' }}
            >
              <Text mb="3" fontSize="14px">
                {t(
                  'PancakeSwap, or related smart contract, you represent that you are noy located in, incorporated or established in, or a citizen or resident of the Prohibited Jurisdictions. You also represent that you are not subject to sanctions or otherwise designated on any list of prohibited or restricted parties or excluded or denied persons, including but not limited to the lists maintained by the United States’ Department of Tresury’s Office Security Council, the European Union or its Member States, or any other government authority.'
                )}
              </Text>
            </Box>
          </Box>
          <label htmlFor="disclaimer-checkbox" style={{ display: 'block', cursor: 'pointer', width: '100%' }}>
            <Flex width="full" justifyContent="space-between" alignItems="center">
              <Text fontSize="sm" fontWeight="medium" color={colors.textPrimary}>
                {t('Agree to terms')}
              </Text>
              <Checkbox scale="sm" id="disclaimer-checkbox" checked={userHaveAgree} onChange={(e) => setUserHaveAgree(e.target.checked)} />
            </Flex>
          </label>

          <Flex width="full" justifyContent="center">
            <Button width="full" onClick={confirmDisclaimer} isDisabled={!userHaveAgree}>
              {t('Enter')}
            </Button>
          </Flex>
        </VStack>
      </MotionModal>
    </ModalV2>
  )
}

export default DisclaimerModal
