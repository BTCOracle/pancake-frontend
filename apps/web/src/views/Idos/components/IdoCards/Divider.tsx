import styled from 'styled-components'

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  margin: 8px 0 0 0;
`
