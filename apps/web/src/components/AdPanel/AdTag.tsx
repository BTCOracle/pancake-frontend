import { Text } from '@pancakeswap/uikit'
import styled, { DefaultTheme } from 'styled-components'

const colors = ['tertiary', 'input']
export const AdTag = ({ title, value, index }: { title: string; value: string; index: number }) => {
  const color = colors[index % colors.length]
  return (
    <TagBox color={color}>
      <Title>{title}</Title>
      <Value>{value}</Value>
    </TagBox>
  )
}

const Title = styled(Text)`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-family: Kanit;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 2%;
`
const Value = styled(Text)`
  color: ${({ theme }) => theme.colors.textSubtle};
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
`

function getThemeColor({ theme, color }) {
  return theme.colors[color]
}

interface ThemedTagBox {
  theme: DefaultTheme
  color: string
}
const TagBox = styled.div<ThemedTagBox>`
  background-color: ${getThemeColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  margin-right: 4px;
  padding: 2px 10px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`
