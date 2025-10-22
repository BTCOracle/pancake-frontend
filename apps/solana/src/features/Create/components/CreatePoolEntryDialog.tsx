import { Button } from '@pancakeswap/uikit'
import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables'
import CircleCheck from '@/icons/misc/CircleCheck'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { logGTMPoolFarmVersionEvent } from '@/utils/report/curstomGTMEventTracking'

type CreateTarget = 'concentrated-liquidity' | 'standard-farm' | 'clmm-lock' | 'cpmm-lock'

export function CreatePoolEntryDialog({
  isOpen,
  onClose,
  defaultType = 'concentrated-liquidity'
}: {
  isOpen: boolean
  onClose: () => void
  defaultType?: CreateTarget
}) {
  const router = useRouter()
  const [type, setType] = useState<CreateTarget>(defaultType)
  const onConfirm = useCallback(() => {
    let to = ''
    const query = { ...router.query }
    switch (type) {
      case 'concentrated-liquidity':
        to = '/clmm/create-pool'
        break
      case 'standard-farm':
        to = '/farms/create'
        break
      case 'clmm-lock':
        to = '/clmm/lock'
        break
      case 'cpmm-lock':
        to = '/liquidity/lock'
        break

      default:
        break
    }

    logGTMPoolFarmVersionEvent(type.includes('farm') ? 'Farm' : 'LP', type.includes('concentrated-liquidity') ? 'V3' : 'V2')
    router.push({
      pathname: to,
      query
    })
  }, [router, type])

  return (
    <>
      <Mobile>
        <CreatePoolEntryMobileDrawer isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
          <CreatePoolEntryDialogBody type={type} onChange={setType} />
        </CreatePoolEntryMobileDrawer>
      </Mobile>
      <Desktop>
        <CreatePoolEntryModal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
          <CreatePoolEntryDialogBody type={type} onChange={setType} />
        </CreatePoolEntryModal>
      </Desktop>
    </>
  )
}

type CreatePoolEntryModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode

  onConfirm?: () => void
}

function CreatePoolEntryModal({ isOpen, onClose, onConfirm, children }: CreatePoolEntryModalProps) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent gap="24px" borderRadius="24px">
        <ModalHeader pt="24px" fontSize="lg" fontWeight={600}>
          {t('I want to...')}
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          <VStack w="full">
            <Button width="100%" variant="primary" onClick={onConfirm}>
              {t('Continue')}
            </Button>
            <Button width="100%" variant="text" onClick={onClose}>
              {t('Cancel')}
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function CreatePoolEntryMobileDrawer({
  isOpen,
  onClose,
  onConfirm,
  children
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton size="sm" />
        <DrawerHeader fontSize="md">{t('I want to...')}</DrawerHeader>
        <DrawerBody mt={4}>{children}</DrawerBody>
        <DrawerFooter mt={4}>
          <VStack w="full">
            <Button width="100%" variant="primary" onClick={onConfirm}>
              {t('Continue')}
            </Button>
            <Button width="100%" variant="text" onClick={onClose}>
              {t('Cancel')}
            </Button>
          </VStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function CreatePoolEntryDialogBody({ type, onChange }: { type: CreateTarget; onChange: (val: CreateTarget) => void }) {
  const { t } = useTranslation()
  const isCreatePool = type === 'concentrated-liquidity'
  // const isCreateFarm = type === 'standard-farm'

  return (
    <Flex direction="column" gap={4}>
      <CreateBlock
        title={t('Create pool')}
        description=""
        renderPoolType={
          isCreatePool
            ? () => (
                <>
                  <Stack flexDirection={['column']} mt={5} gap={5}>
                    <PoolTypeItem
                      isActive={type === 'concentrated-liquidity'}
                      content={
                        <Box lineHeight="1.5">
                          <Text whiteSpace="nowrap" fontSize="md" fontWeight={600}>
                            {t('V3 Pools')}
                          </Text>
                          <Text fontSize="xs" color={colors.textSubtle}>
                            {t('Custom ranges, increased capital efficiency')}
                          </Text>
                        </Box>
                      }
                      onClickSelf={() => onChange('concentrated-liquidity')}
                    />
                  </Stack>
                </>
              )
            : undefined
        }
        selected={isCreatePool}
        onClick={() => onChange('concentrated-liquidity')}
      />

      {/* <CreateBlock
          title={t('Create Farm')}
          description=""
          renderPoolType={
            isCreateFarm
              ? () => (
                  <>
                    <Stack flexDirection={['column']} mt={2} gap={5}>
                      <Text whiteSpace="nowrap" fontSize="md" fontWeight={500} color={colors.textSubtle}>
                        {t('Create a farm for any live pool')}
                      </Text>
                    </Stack>
                  </>
                )
              : undefined
          }
          selected={isCreateFarm}
          onClick={() => onChange('standard-farm')}
        /> */}
    </Flex>
  )
}
function CreateBlock(props: {
  title: string
  description: React.ReactNode
  selected?: boolean
  onClick?: () => void
  detailLinkUrl?: string
  renderPoolType?: () => React.ReactNode
}) {
  const parentRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [height, setHeight] = useState(contentRef.current?.scrollHeight)

  useEffect(() => {
    const el = contentRef.current
    if (el) {
      setHeight(el.scrollHeight + 32)
    }
  }, [props.selected, props.renderPoolType])

  return (
    <Box
      backgroundColor={props.selected ? colors.inputBg : colors.cardSecondary}
      p={4}
      borderRadius="3xl"
      position="relative"
      cursor="pointer"
      borderWidth="1px"
      borderColor={props.selected ? colors.secondary : colors.cardBorder01}
      borderStyle="solid"
      onClick={props.onClick}
      ref={parentRef}
      transition="all 0.3s ease-out"
      willChange="height"
      overflow="hidden"
      style={{ height }}
    >
      <Box ref={contentRef}>
        <Flex justify="space-between">
          <Text fontSize="md" fontWeight="600">
            {props.title}
          </Text>
          {props.selected && <CircleCheck width={16} height={16} fill={colors.secondary} />}
        </Flex>

        <Box color={props.selected ? colors.textSecondary : colors.textTertiary} fontSize="sm">
          {props.description}
        </Box>

        {props.renderPoolType && <Box mt={2}>{props.renderPoolType()}</Box>}
      </Box>
    </Box>
  )
}

function PoolTypeItem({
  content,
  isActive,
  onClickSelf,
  isSuggested,
  isDisabled
}: {
  content: React.ReactNode
  isActive?: boolean
  onClickSelf?: () => void
  isSuggested?: boolean
  isDisabled?: boolean
}) {
  const domRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    const el = domRef.current
    const handleClick = (ev: MouseEvent) => {
      ev.stopPropagation()
      if (!isDisabled) {
        onClickSelf?.()
      }
    }

    el?.addEventListener('click', handleClick)
    return () => {
      el?.removeEventListener('click', handleClick)
    }
  }, [isDisabled, onClickSelf])

  return (
    <HStack
      ref={domRef}
      flexGrow={1}
      color={isActive ? colors.textPrimary : colors.textSubtle}
      bg={isActive ? colors.backgroundAlt : 'transparent'}
      px={4}
      py={2}
      rounded="2xl"
      position="relative"
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
    >
      {isSuggested && (
        <Box position="absolute" top={0} right={2} transform="auto" translateY="-50%">
          <Badge variant="crooked">{t('Suggested')}</Badge>
        </Box>
      )}
      {content}
    </HStack>
  )
}
