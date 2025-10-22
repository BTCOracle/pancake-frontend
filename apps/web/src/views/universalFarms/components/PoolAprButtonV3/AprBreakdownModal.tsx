import { useTranslation } from '@pancakeswap/localization'
import { FlexGap, ModalV2, ModalV2Props, MotionModal } from '@pancakeswap/uikit'
import { Liquidity, Tips } from '@pancakeswap/widgets-internal'
import { useMemo } from 'react'
import { type APRBreakdownProps, useAPRBreakdown } from 'views/universalFarms/hooks/useAPRBreakdown'

import { StopPropagation } from '../StopPropagation'

type APRBreakdownModalProps = ModalV2Props & APRBreakdownProps

export const APRBreakdownModal = ({ isOpen, onDismiss, closeOnOverlayClick, ...props }: APRBreakdownModalProps) => {
  const { t } = useTranslation()

  const { additionalDetails, primaryMsg } = useMemo(
    () => ({
      primaryMsg: t(
        'Calculated at the current rates with historical trading volume data, and subject to change based on various external variables.',
      ),
      additionalDetails: t(
        'This figure is provided for your convenience only, and by no means represents guaranteed returns.',
      ),
    }),
    [t],
  )

  const rewards = useAPRBreakdown(props)

  return (
    <StopPropagation>
      <ModalV2 onDismiss={onDismiss} isOpen={isOpen} closeOnOverlayClick={closeOnOverlayClick}>
        <MotionModal
          width={['100%', '100%', '100%', '520px']}
          title={t('APR Breakdown')}
          headerBorderColor="transparent"
        >
          <FlexGap gap="24px" flexDirection="column">
            <Liquidity.RewardCard rewards={rewards} />
            <Tips primaryMsg={primaryMsg} additionalDetails={additionalDetails} />
          </FlexGap>
        </MotionModal>
      </ModalV2>
    </StopPropagation>
  )
}
