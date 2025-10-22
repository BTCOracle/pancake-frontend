import { useTranslation } from '@pancakeswap/localization'
import { ModalProps, MotionModal } from '@pancakeswap/uikit'

interface ConfirmSwapModalV3ContainerProps extends Partial<ModalProps> {
  hideTitleAndBackground?: boolean
  headerPadding?: string
  headerBackground?: string
  bodyTop?: string
  bodyPadding?: string
  handleDismiss: () => void
  title?: string
}

const ConfirmSwapModalV3Container: React.FC<React.PropsWithChildren<ConfirmSwapModalV3ContainerProps>> = ({
  children,
  headerPadding,
  bodyTop,
  bodyPadding,
  hideTitleAndBackground,
  headerBackground,
  handleDismiss,
  title,
  ...props
}) => {
  const { t } = useTranslation()

  return (
    <MotionModal
      title={hideTitleAndBackground ? '' : title || t('Confirm Swap')}
      headerPadding={hideTitleAndBackground && headerPadding ? headerPadding : '12px 24px'}
      bodyPadding={bodyPadding || '24px'}
      bodyTop={bodyTop}
      headerBackground={headerBackground || (hideTitleAndBackground ? 'transparent' : 'gradientCardHeader')}
      headerBorderColor="transparent"
      onDismiss={handleDismiss}
      {...props}
    >
      {children}
    </MotionModal>
  )
}

export default ConfirmSwapModalV3Container
