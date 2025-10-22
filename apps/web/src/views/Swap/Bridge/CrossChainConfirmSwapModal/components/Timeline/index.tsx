import {
  Box,
  CheckmarkCircleFillIcon,
  CircleOutlineIcon,
  FlexGap,
  LinkExternal,
  ScanLink,
  SwapSpinner,
  WarningIcon,
} from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { css } from 'styled-components'
import { useBlockExploreLink } from 'utils'

export type TimelineItemStatus = 'completed' | 'inProgress' | 'failed' | 'warning' | 'notStarted'

export interface TimelineItemProps {
  title: string | React.ReactNode
  subtitle?: string
  icon?: React.ReactNode
  status: TimelineItemStatus
  errorMessage?: string
  warningMessage?: string
  isLast?: boolean
  id: string
  tx?: {
    hash: string
    chainId: number
  }
}

const TimelineWrapper = styled(FlexGap).attrs({ flexDirection: 'column' })`
  width: 100%;
`

const Line = styled.div<{ height?: number }>`
  position: absolute;
  top: 67%;
  left: 0;
  width: 2px;
  min-height: 18px;
  flex: 1;
  margin-left: 10px;

  height: ${({ height }) => `${height}px` || '100%'};
  background-color: ${({ theme }) => theme.colors.inputSecondary};
`

const IconWrapper = styled.div<{ status: TimelineItemStatus }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;

  margin-top: -1px;

  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return css`
          color: ${theme.colors.success};
        `
      case 'failed':
        return css`
          color: ${theme.colors.failure};
        `
      case 'warning':
        return css`
          color: ${theme.colors.warning60};
        `
      default:
        return css`
          color: ${theme.colors.textDisabled};
        `
    }
  }}
`

const Title = styled.div<{ status: TimelineItemStatus }>`
  color: ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return theme.colors.primary60
      case 'failed':
        return theme.colors.failure
      case 'warning':
        return theme.colors.warning60
      default:
        return theme.colors.text
    }
  }};
  font-size: 14px;
  font-weight: 600;
`

const Subtitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-left: 4px;
`

const MessageBox = styled.div<{ variant: 'error' | 'warning' }>`
  position: absolute;
  left: 28px;
  background: ${({ variant, theme }) => (variant === 'error' ? theme.colors.destructive10 : theme.colors.warning10)};
  border: 1px solid
    ${({ variant, theme }) => (variant === 'error' ? theme.colors.destructive20 : theme.colors.warning20)};
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 14px;

  max-width: 300px;
  line-height: 1.4;
`

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  subtitle,
  icon,
  status,
  errorMessage,
  warningMessage,
  isLast,
  tx,
}) => {
  const [, setShouldRecalculate] = useState(false)
  const getBlockExploreLink = useBlockExploreLink()

  useEffect(() => {
    // Trigger a re-render after initial mount to recalculate heights
    setShouldRecalculate(true)
  }, [])

  const getDefaultIcon = useCallback(() => {
    switch (status) {
      case 'completed':
        return <CheckmarkCircleFillIcon color="success" />
      case 'warning':
        return <WarningIcon color="binance" mr="2px" />
      case 'failed':
        return <WarningIcon color="binance" mr="2px" />
      case 'inProgress':
        return <SwapSpinner width="24px" height="24px" padding="3px" />
      case 'notStarted':
        return <CircleOutlineIcon color="textDisabled" />
      default:
        return <div style={{ width: 24, height: 24 }} />
    }
  }, [status])

  const linkColor = useMemo(() => {
    switch (status) {
      case 'failed':
        return 'failure'
      case 'warning':
        return 'warning'
      default:
        return 'primary60'
    }
  }, [status])

  const explorerLink = tx && tx.hash && getBlockExploreLink(tx.hash, 'transaction', tx.chainId)

  const titleRef = useRef<HTMLDivElement | null>(null)
  const messageBoxRef = useRef<HTMLDivElement | null>(null)
  const MESSAGE_BOX_OFFSET = 8

  return (
    <Box
      width="100%"
      position="relative"
      marginBottom={
        titleRef.current && messageBoxRef.current
          ? `${messageBoxRef.current.offsetHeight + MESSAGE_BOX_OFFSET + 8}px`
          : '12px'
      }
    >
      <LinkExternal
        href={explorerLink}
        showExternalIcon={false}
        color={linkColor}
        rel="noopener noreferrer"
        style={{ width: '100%' }}
      >
        <FlexGap alignItems="start" gap="8px" width="100%" maxWidth="400px" ref={titleRef}>
          <IconWrapper status={status}>{icon || getDefaultIcon()}</IconWrapper>
          <Title status={status}>
            {title}
            {subtitle && <Subtitle>({subtitle})</Subtitle>}
          </Title>
          {explorerLink && <ScanLink href={explorerLink} color={linkColor} useBscCoinFallback />}
        </FlexGap>
      </LinkExternal>
      {(status === 'failed' || status === 'warning') && (errorMessage || warningMessage) && titleRef.current && (
        <MessageBox
          variant={status === 'failed' ? 'error' : 'warning'}
          style={{
            top: titleRef.current.offsetHeight + MESSAGE_BOX_OFFSET,
          }}
          ref={messageBoxRef}
        >
          {errorMessage || warningMessage}
        </MessageBox>
      )}
      {!isLast && (
        <Line height={(messageBoxRef.current?.offsetHeight || 0) + (titleRef.current?.offsetHeight || 0) / 2 + 12} />
      )}
    </Box>
  )
}

export interface TimelineProps {
  items: TimelineItemProps[]
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <TimelineWrapper>
      {items &&
        items.length > 0 &&
        items.map((item, index) => <TimelineItem key={item.id} {...item} isLast={index === items.length - 1} />)}
    </TimelineWrapper>
  )
}
