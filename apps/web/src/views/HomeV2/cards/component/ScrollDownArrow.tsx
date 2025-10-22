import styled from 'styled-components'

const getArrowBottom = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) return '16px'
  if (isTablet) return '20px'
  return '24px'
}

export const ScrollDownArrow = styled.div<{ isMobile: boolean; isTablet: boolean }>`
  position: absolute;
  bottom: ${({ isMobile, isTablet }) => getArrowBottom(isMobile, isTablet)};
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 2s infinite;

  @keyframes bounce {
    0%,
    20%,
    50%,
    80%,
    100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-10px);
    }
    60% {
      transform: translateX(-50%) translateY(-5px);
    }
  }
`
