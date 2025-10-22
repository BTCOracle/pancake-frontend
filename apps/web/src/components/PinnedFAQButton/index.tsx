import { useTranslation } from '@pancakeswap/localization'
import {
  Box,
  Button,
  FlexGap,
  getPortalRoot,
  HelpIcon,
  IconButton,
  LinkExternal,
  Modal,
  ModalProps,
  ModalV2,
  Text,
} from '@pancakeswap/uikit'
import ChevronsCollapse from '@pancakeswap/uikit/components/Svg/Icons/ChevronsCollapse'
import FoldableText from 'components/FoldableSection/FoldableText'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { styled } from 'styled-components'

const FixedContainer = styled.div`
  position: fixed;
  right: 18px;
  bottom: calc(54px + env(safe-area-inset-bottom));
`

const FaqModal: React.FC<React.PropsWithChildren<ModalProps>> = ({ children, ...props }) => {
  return (
    <Modal
      hideCloseButton
      minHeight="415px"
      width={['100%', '100%', '100%', '400px']}
      headerPadding="12px 24px"
      bodyPadding="16px 24px"
      headerBackground="transparent"
      headerProps={{
        width: '100%',
        textAlign: 'center',
        py: '4px',
      }}
      {...props}
    >
      {children}
    </Modal>
  )
}

export interface FaqConfig {
  title: ReactNode
  description: ReactNode[]
}

interface PinnedFAQButtonProps {
  faqConfig: FaqConfig[]
  docLink: string
}

const PinnedFAQButton: React.FC<PinnedFAQButtonProps> = ({ faqConfig, docLink }) => {
  const [visible, setVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!anchorRef.current) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show fixed button when anchor is not visible (off screen)
        setVisible(!entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(anchorRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleOpenModal = (e) => {
    e.preventDefault()
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const button = (
    <Button
      px="0px"
      style={{ borderRadius: visible ? '' : '12px' }}
      width={visible ? '48px' : '36px'}
      height={visible ? '48px' : '36px'}
      variant="subtle"
      onClick={handleOpenModal}
    >
      <HelpIcon ml="0" color="invertedContrast" width="24px" />
    </Button>
  )

  const portal = useMemo(() => getPortalRoot(), [])

  return (
    <>
      <Box ref={anchorRef} id="anchor-fqa-button">
        {button}
      </Box>
      {portal &&
        createPortal(
          <FixedContainer style={{ display: visible ? 'inline' : 'none' }}>{button}</FixedContainer>,
          portal,
        )}

      <ModalV2 isOpen={showModal} onDismiss={handleCloseModal} closeOnOverlayClick>
        <FaqModal onDismiss={handleCloseModal} title={t('Quick start')}>
          <Box
            border="2px solid"
            borderColor="cardBorder"
            borderRadius="24px"
            backgroundColor="background"
            overflowX="hidden"
            overflowY="auto"
          >
            <>
              {faqConfig.map(({ title, description }, i) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <FoldableText
                    expandableLabelProps={{
                      iconColor: 'secondary',
                      iconSize: '24px',
                      height: '24px',
                    }}
                    wrapperProps={{
                      py: '16px',
                    }}
                    hideExpandableLabel
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    title={title}
                    borderBottom="1px solid"
                    borderColor="cardBorder"
                    px="20px"
                  >
                    {description.map((desc, index) => {
                      return (
                        // eslint-disable-next-line react/no-array-index-key
                        <Text key={index} color="textSubtle" as="p">
                          {desc}
                        </Text>
                      )
                    })}
                  </FoldableText>
                )
              })}
            </>
          </Box>
          <FlexGap flexDirection="row" gap="16px" mt="16px">
            <IconButton minWidth="fit-content" variant="text" onClick={handleCloseModal} display="flex">
              {t('Hide')}
              <Box position="relative" top="2px" left="4px">
                <ChevronsCollapse width="24px" height="24px" color="primary" />
              </Box>
            </IconButton>
            <Button width="100%" variant="subtle" as="a" target="_blank" href={docLink}>
              <LinkExternal color="backgroundAlt" href={docLink}>
                {t('View details in Docs')}
              </LinkExternal>
            </Button>
          </FlexGap>
        </FaqModal>
      </ModalV2>
    </>
  )
}

export default PinnedFAQButton
