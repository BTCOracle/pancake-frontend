import styled from 'styled-components'
import { FlexGap, Text } from '@pancakeswap/uikit'

export const DetailInfoTitle = styled.div<{ $isMobile?: boolean }>`
  display: flex;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  flex-direction: ${({ $isMobile }) => ($isMobile ? 'column' : 'row')};
`

export const DetailInfoDesc = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  font-weight: 400;
`

export const DetailInfoLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-weight: 600;
  font-size: 12px;
`

export const TagCell = styled(FlexGap)`
  position: absolute;
  right: 0;
  top: 0;
  padding: 16px;
`
