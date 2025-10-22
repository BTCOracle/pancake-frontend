import { useTranslation } from '@pancakeswap/localization'
import { Button, Modal, ModalV2, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useRouter } from 'next/router'
import { Suspense, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useShowCb1Popup } from './useCb1Membership'

export const Cb1Membership = () => {
  return (
    <Suspense fallback={null}>
      <Cb1Inner />
    </Suspense>
  )
}

const Cb1Inner = () => {
  const { t } = useTranslation()
  const showCb1 = useShowCb1Popup()
  const [close, setClose] = useState(showCb1)
  const { isMobile } = useMatchBreakpoints()
  const router = useRouter()

  useEffect(() => {
    if (!showCb1) {
      setClose(false)
    }
  }, [showCb1])
  return (
    <ModalV2
      isOpen={showCb1 && !close}
      closeOnOverlayClick
      onDismiss={() => {
        setClose(true)
      }}
    >
      <Modal title={t('You are Eligible!')} width={isMobile ? '100%' : '336px'}>
        <Cb1Image src={`${ASSET_CDN}/web/promotions/cb1.png`} />
        <Text
          style={{
            marginTop: '24px',
          }}
        >
          $8,453 {t('to be earned!')}
        </Text>
        <Text
          style={{
            marginTop: '24px',
          }}
        >
          <b>Coinbase One </b>
          {t(
            'members who trade on PancakeSwap on Base, BNB, or Arbitrum are eligible to earn a portion of $8,453 airdropped to their wallet biweekly! Must trade a minimum of $100 to qualify.',
          )}
        </Text>
        <Button
          style={{
            marginTop: '24px',
          }}
          onClick={() => {
            router.replace('/')
            setClose(true)
          }}
        >
          {t('Trade now to participate!')}
        </Button>
      </Modal>
    </ModalV2>
  )
}

const Cb1Image = styled.img`
  width: 100%;
  height: auto;
`
