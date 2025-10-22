import { styled } from 'styled-components'

const Divider = styled.hr<{ thin?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  width: 100%;
  ${({ thin, theme }) =>
    thin &&
    `
  border: none;
  border-top: 1px solid ${theme.colors.cardBorder};
    `}
`

export default Divider
