import { useTranslation } from '@pancakeswap/localization'
import { ArrowForwardIcon, Box, FlexGap, Text } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { useRouter } from 'next/router'
import React from 'react'
import styled from 'styled-components'
import { ViewState } from './type'

interface EmptyWalletActionsProps {
  onDismiss: () => void
  setViewState: (state: ViewState) => void
  description?: string
}

const OptionBox = styled(Box)`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 24px;
  padding: 16px;
  width: 45%;
  border: 1px solid ${({ theme }) => (theme.isDark ? '#55496E' : '#D7CAEC')};
  text-align: center;
  cursor: pointer;
`

const EmptyWalletActions: React.FC<EmptyWalletActionsProps> = ({ onDismiss, setViewState, description }) => {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Box padding="8px 16px">
      <Text color="textSubtle" textAlign="center" mb="16px">
        {description || t('This wallet looks new — choose an option below to add crypto and start trading')}
      </Text>
      <FlexGap gap="16px" justifyContent="center" flexWrap="wrap">
        <OptionBox
          onClick={() => {
            router.push('/buy-crypto')
            onDismiss()
          }}
        >
          <Box mb="16px" mx="auto" width="60px" height="60px">
            <img src={`${ASSET_CDN}/web/landing/trade-buy-crypto.png`} width="60px" alt="Buy Crypto" />
          </Box>
          <Text bold color="secondary" fontSize="16px" mb="8px">
            {t('Buy')}
          </Text>
          <Text fontSize="14px" color="textSubtle">
            {t('Purchase with credit card, Apple Pay, or Google Pay.')}
          </Text>
        </OptionBox>
        <OptionBox
          onClick={() => {
            setViewState(ViewState.RECEIVE_OPTIONS)
          }}
        >
          <Box mb="16px" mx="auto" width="60px" height="60px">
            <img src={`${ASSET_CDN}/web/landing/earn-fixed-staking.png`} width="60px" alt="Receive Crypto" />
          </Box>
          <Text bold color="secondary" fontSize="16px" mb="8px" ml="8px">
            {t('Receive')}
          </Text>
          <Text fontSize="14px" color="textSubtle">
            {t('Receive crypto from another wallet.')}
          </Text>
        </OptionBox>
      </FlexGap>
      <FlexGap
        justifyContent="center"
        alignItems="center"
        mt="24px"
        onClick={() => {
          router.push('/bridge')
        }}
        style={{ cursor: 'pointer' }}
      >
        <Text bold color="primary" fontSize="16px">
          {t('Bridge Crypto')}
        </Text>
        <ArrowForwardIcon color="primary" />
      </FlexGap>
    </Box>
  )
}

export default EmptyWalletActions
