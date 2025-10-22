import { useEffect } from 'react'
import { Button } from '@pancakeswap/uikit'
import {
  Flex,
  Image,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  useClipboard
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from '@pancakeswap/localization'
import { colors } from '@/theme/cssVariables/colors'
import { encodeStr } from '@/utils/common'
import CopyIcon from '@/icons/misc/CopyIcon'
import ExternalLink from '@/icons/misc/ExternalLink'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { useAppStore, supportedExplorers } from '@/store/useAppStore'
import { pageRoutePathnames } from '@/utils/config/routers'

export default function DepositedNFTModal({ nftAddress, isOpen, onClose }: { nftAddress: string; isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const { t } = useTranslation()
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const { onCopy, setValue } = useClipboard(nftAddress)

  useEffect(() => {
    setValue(nftAddress)
  }, [setValue, nftAddress])

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="xl">{t('Deposit successfully')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text variant="title" color={colors.textPrimary} fontSize="sm" mb="6" fontWeight="400">
            {t('A new NFT representing your Concentrated Liquidity position is now in your wallet.')}
          </Text>
          <Flex
            m="0 auto"
            py="2"
            px="4"
            gap="1"
            rounded="full"
            alignItems="center"
            w="fit-content"
            fontSize="sm"
            fontWeight="400"
            mt="2"
            bg={colors.textSubtle}
            color={colors.backgroundAlt}
          >
            <Text>{t('NFT Mint')}:</Text>
            <Text mr="2">{encodeStr(nftAddress, 5, 3)}</Text>
            <CopyIcon
              color={colors.backgroundAlt}
              cursor="pointer"
              onClick={() => {
                onCopy()
                toastSubject.next({
                  status: 'success',
                  title: t('Copied successfully!')
                })
              }}
            />
            <a
              href={
                explorerUrl === supportedExplorers[0]?.host ? `${explorerUrl}/token/${nftAddress}` : `${explorerUrl}/address/${nftAddress}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink color={colors.backgroundAlt} cursor="pointer" width="14" height="14" />
            </a>
          </Flex>

          <Text fontSize="sm" color={colors.textPrimary} mt="4" mb="2">
            {t(
              'DO NOT burn this NFT or you will lose the ability to claim fees forever! If you send the NFT to another wallet, only the new wallet will be able to claim fees.'
            )}
          </Text>
        </ModalBody>
        <ModalFooter px="0" py="0" mt="4" mb="2">
          <Button
            onClick={() => router.push(pageRoutePathnames.portfolio, { query: { tab: 'concentrated' }, hash: 'my-position' })}
            width="100%"
          >
            {t('View my positions')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
