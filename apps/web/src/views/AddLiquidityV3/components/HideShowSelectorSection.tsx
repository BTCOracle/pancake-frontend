import { useTranslation } from '@pancakeswap/localization'
import { AutoRow, Button, ChevronDownIcon, Text, useIsomorphicEffect, useMatchBreakpoints } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { Dispatch, ReactNode, SetStateAction, useRef } from 'react'
import styled from 'styled-components'

const StyledLightGreyCard = styled(LightGreyCard)`
  padding: 16px;
  border-radius: 16px;
  height: fit-content;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom: 2px solid ${({ theme }) => theme.colors.cardBorder};

  height: 0px;

  transition: height 0.2s ease-in-out;
  will-change: height;

  overflow: hidden;
`

interface HideShowSelectorSectionPropsType {
  noHideButton?: boolean
  showOptions: boolean
  setShowOptions: Dispatch<SetStateAction<boolean>>
  heading: ReactNode
  content: ReactNode
}

const PADDING = 32

export default function HideShowSelectorSection({
  noHideButton,
  showOptions,
  setShowOptions,
  heading,
  content,
}: HideShowSelectorSectionPropsType) {
  const { t } = useTranslation()

  const { isXs } = useMatchBreakpoints()

  const parentRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useIsomorphicEffect(() => {
    const parent = parentRef.current
    const header = headerRef.current
    const content = contentRef.current
    if (parent && content && showOptions) {
      const headerHeight = header?.scrollHeight ?? 0
      const contentHeight = content.scrollHeight
      parent.style.height = `${contentHeight + headerHeight + PADDING * 2 + 16}px`
    } else if (parent && !showOptions) {
      parent.style.height = `${header?.scrollHeight ?? 0 + PADDING * 2}px`
    }
  }, [showOptions])

  return (
    <StyledLightGreyCard ref={parentRef}>
      <AutoRow
        justifyContent="space-between"
        alignItems="center"
        marginBottom={showOptions ? '8px' : '0px'}
        ref={headerRef}
      >
        {heading ?? <div />}
        {noHideButton || (
          <Button
            scale={isXs ? 'xs' : 'sm'}
            onClick={() => setShowOptions((prev) => !prev)}
            variant="text"
            endIcon={
              <ChevronDownIcon
                style={{
                  marginLeft: '0px',
                  transform: showOptions ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease-in-out',
                }}
                color="primary60"
              />
            }
          >
            <Text color="primary60" fontSize={['12px', '16px']} bold>
              {showOptions ? t('Hide') : t('More')}
            </Text>
          </Button>
        )}
      </AutoRow>
      {showOptions && <div ref={contentRef}>{content}</div>}
    </StyledLightGreyCard>
  )
}
