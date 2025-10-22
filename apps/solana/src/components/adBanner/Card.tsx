import { Box, BoxProps, CloseIcon, IconButton, useMatchBreakpoints } from '@pancakeswap/uikit'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { useShowAdPanel } from '@pancakeswap/widgets-internal'
import { forwardRef, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const BaseCard = styled(Box)<{ $isExpanded?: boolean }>`
  position: relative;

  width: 328px;
  height: 164px;
  padding: 16px;

  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};

  transition: height 0.2s ease-in-out 0.05s;

  ${({ $isExpanded }) =>
    $isExpanded &&
    `  
    padding: 0;
  `}
`

const Content = styled(Box)<{ $isMobile?: boolean; $isExpanded?: boolean }>`
  position: relative;
  width: 148px;
  ${({ $isMobile }) => $isMobile && `width: 164px;`}

  height: 98%;

  flex-direction: column;
  justify-content: space-between;

  user-select: none;

  z-index: 2;

  ${({ $isExpanded }) =>
    $isExpanded &&
    `  
    width: 100%;
    height: 100%;
  `}
`

const GraphicsContainer = styled(Box)`
  position: absolute;
  bottom: -2px;
  right: -1px;

  width: 207px;
  height: 188px;

  user-select: none;

  z-index: 1;
`

const CloseButtonContainer = styled(Box)<{ $isMobile?: boolean }>`
  position: absolute;
  border-radius: 100%;
  z-index: 3;

  right: ${({ $isMobile }) => ($isMobile ? '8px' : '0')};
  top: ${({ $isMobile }) => ($isMobile ? '8px' : '-28px')};

  ${({ theme, $isMobile }) => $isMobile && `background-color: ${theme.colors.card};`}
`

const StyledIconButton = styled(IconButton).attrs({ variant: 'text' })`
  height: 12px;
  width: 12px !important;
  padding: 12px;
  transition: all 0.4s;
  color: ${({ theme }) => theme.colors.textSubtle};

  &:hover {
    color: white;
    background-color: ${({ theme }) => theme.colors.textSubtle};
  }
`

interface AdCardProps extends BoxProps {
  children?: React.ReactNode
  imageUrl?: string
  alt?: string
  imgPadding?: string

  isExpanded?: boolean

  isDismissible?: boolean

  /**
   * Force mobile view to show Modal on expanding FAQ
   */
  forceMobile?: boolean
}

export const AdCard = forwardRef<HTMLDivElement, AdCardProps>(
  ({ children, imageUrl, alt, isExpanded, forceMobile, isDismissible = true, imgPadding, ...props }, ref) => {
    const imageRef = useRef<HTMLImageElement>(null)
    const [isExpandTriggered, setIsExpandTriggered] = useState(false)

    // Drag handle, Slider and other slots will come here
    const { isDesktop } = useMatchBreakpoints()
    const [, setShowAdPanel] = useShowAdPanel()

    const isMobile = forceMobile || !isDesktop

    useEffect(() => {
      if (isExpanded) {
        setIsExpandTriggered(true)
      }
    }, [isExpanded])

    useEffect(() => {
      if (imageRef.current && !isUndefinedOrNull(isExpanded) && isExpandTriggered) {
        if (isExpanded) {
          imageRef.current.animate(
            [
              { opacity: 1, zIndex: 1, transform: 'scale(1)' },
              { opacity: 0, zIndex: -1, transform: 'scale(0.96)' }
            ],
            {
              duration: 50,
              fill: 'forwards',
              easing: 'ease-in-out'
            }
          )
        } else {
          imageRef.current.animate(
            [
              { opacity: 0, zIndex: -1, transform: 'scale(0.96)' },
              { opacity: 1, zIndex: 1, transform: 'scale(1)' }
            ],
            {
              duration: 200,
              fill: 'forwards',
              easing: 'ease-in-out'
            }
          )
        }
      }
    }, [imageRef, isExpandTriggered, isExpanded])

    return (
      <BaseCard $isExpanded={isExpanded} {...props} ref={ref}>
        <Content $isMobile={isMobile} $isExpanded={isExpanded}>
          {children}
        </Content>
        {isDismissible && (
          <CloseButtonContainer $isMobile={isMobile} onClick={() => setShowAdPanel(false)} role="button" aria-label="Close Ad Panel">
            <StyledIconButton aria-label="Close the Ad banner">
              <CloseIcon color="inherit" />
            </StyledIconButton>
          </CloseButtonContainer>
        )}
        <GraphicsContainer>
          {imageUrl && (
            <ImgBox
              style={{
                padding: imgPadding
              }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt={alt || 'Card Image'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </ImgBox>
          )}
        </GraphicsContainer>
      </BaseCard>
    )
  }
)

const ImgBox = styled(Box)`
  width: 207px;
  height: 188px;
  display: flex;
  justify-content: center;
  align-items: center;
`
