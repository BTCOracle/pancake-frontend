import { Box, CopyIcon, copyText, Flex, FlexProps, IconButton, SvgProps, TooltipOptions, useTooltip } from '@pancakeswap/uikit'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { colors } from '@/theme/cssVariables'

const Wrapper = styled(Flex)`
  align-items: center;
  background-color: ${colors.dropdown};
  border-radius: 16px;
  position: relative;
`

const Address = styled.div`
  flex: 1;
  position: relative;
  padding-left: 16px;

  & > input {
    background: transparent;
    border: 0;
    color: ${colors.textPrimary};
    display: block;
    font-weight: 600;
    font-size: 16px;
    padding: 0;
    width: 100%;

    &:focus {
      outline: 0;
    }
  }

  &:after {
    background: linear-gradient(to right, ${colors.background}00, ${colors.background}E6);
    content: '';
    height: 100%;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    width: 40px;
  }
`

interface CopyAddressProps extends FlexProps {
  account: string | undefined
  tooltipMessage: string
}

export const WalletAddress: React.FC<React.PropsWithChildren<CopyAddressProps>> = ({ account, tooltipMessage, ...props }) => {
  return (
    <Box position="relative" {...props}>
      <Wrapper>
        <Address title={account}>
          <input type="text" value={account} readOnly />
        </Address>
        <Flex m="12px">
          <CopyButton width="24px" text={account ?? ''} tooltipMessage={tooltipMessage} />
        </Flex>
      </Wrapper>
    </Box>
  )
}

interface CopyButtonProps extends SvgProps {
  text: string
  tooltipMessage: string
  defaultTooltipMessage?: string
  tooltipPlacement?: TooltipOptions['placement']
  buttonColor?: string
  icon?: React.ElementType
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  tooltipMessage,
  defaultTooltipMessage,
  width,
  tooltipPlacement = 'auto',
  buttonColor = 'primary',
  icon: Icon = CopyIcon,
  ...props
}) => {
  const { t } = useTranslation()
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(isTooltipDisplayed ? tooltipMessage : defaultTooltipMessage, {
    placement: tooltipPlacement,
    manualVisible: !defaultTooltipMessage,
    trigger: 'hover'
  })

  const showToolTip = defaultTooltipMessage ? tooltipVisible : isTooltipDisplayed

  const displayTooltip = useCallback(() => {
    setIsTooltipDisplayed(true)
  }, [])

  const handleOnClick = useCallback(() => {
    copyText(text, displayTooltip)
  }, [text, displayTooltip])

  useEffect(() => {
    if (isTooltipDisplayed) {
      const tooltipTimeout = setTimeout(() => {
        setIsTooltipDisplayed(false)
      }, 1000)
      return () => clearTimeout(tooltipTimeout)
    }

    return undefined
  }, [isTooltipDisplayed])

  return (
    <>
      <div ref={targetRef}>
        <IconButton title={t('Copy')} onClick={handleOnClick} scale="sm" variant="text" style={{ width: 'auto', position: 'relative' }}>
          {props.children}
          <Icon color={buttonColor} width={width} {...props} />
        </IconButton>
      </div>
      {showToolTip && tooltip}
    </>
  )
}
