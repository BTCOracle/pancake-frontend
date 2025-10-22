import { ASSET_CDN } from 'config/constants/endpoints'
import { memo } from 'react'
import { css, keyframes, styled } from 'styled-components'

export const SnowflakesWrapper = styled.div<{ $itemCount: number }>`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  ${({ $itemCount }) => generateRandomOpacityStyles($itemCount)};
`

const XmaxBg = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100vw;
  height: 40.625vw;
  background: url('${ASSET_CDN}/web/swap/xmas/xmas-bg-${({ theme }) => (theme.isDark ? 'dark' : 'light')}.png')
    no-repeat center center fixed;
  background-size: cover;
`

const XmaxTree = styled.div`
  position: absolute;
  bottom: 5%;
  ${({ theme }) => theme.mediaQueries.md} {
    bottom: 15%;
  }

  left: 1%;
  width: 26vw;
  height: 15vw;
  background: url('${ASSET_CDN}/web/swap/new-year/new-year-${({ theme }) => (theme.isDark ? 'dark' : 'light')}.png')
    no-repeat center center fixed;
  background-size: cover;
`

const snowflakeAnimation = keyframes`
  0% {
    transform: translateY(0px) translateX(0px);
  }
  10% {
    transform: translateY(10vh) translateX(27px); 
  }
  20% {
    transform: translateY(20vh) translateX(53px); 
  }
  30% {
    transform: translateY(30vh) translateX(80px); 
  }
  40% {
    transform: translateY(40vh) translateX(53px); 
  }
  50% {
    transform: translateY(50vh) translateX(27px); 
  }
  60% {
    transform: translateY(60vh) translateX(80px); 
  }
  70% {
    transform: translateY(70vh) translateX(0px); 
  }
  80% {
    transform: translateY(80vh) translateX(27px); 
  }
  90% {
    transform: translateY(90vh) translateX(53px); 
  }
  100% {
    transform: translateY(100vh) translateX(80px); 
  }
`
export const Snowflake = styled.div`
  position: fixed;
  top: -10%;
  z-index: 9999;
  color: #fff;
  font-size: 1em;
  font-family: Arial;
  text-shadow: ${({ theme }) => (theme.isDark ? '0 0 1px #000' : 'none')};
  user-select: none;
  cursor: default;
  will-change: transform;
  animation: ${snowflakeAnimation} 15s linear infinite;

  &:nth-of-type(1) {
    left: 1%;
    animation-delay: 0s, 0s;
  }
  &:nth-of-type(2) {
    left: 10%;
    animation-delay: 1s, 1s;
  }
  &:nth-of-type(3) {
    left: 20%;
    animation-delay: 6s, 0.5s;
  }
  &:nth-of-type(4) {
    left: 30%;
    animation-delay: 4s, 2s;
  }
  &:nth-of-type(5) {
    left: 40%;
    animation-delay: 2s, 2s;
  }
  &:nth-of-type(6) {
    left: 50%;
    animation-delay: 8s, 3s;
  }
  &:nth-of-type(7) {
    left: 60%;
    animation-delay: 6s, 2s;
  }
  &:nth-of-type(8) {
    left: 70%;
    animation-delay: 2.5s, 1s;
  }
  &:nth-of-type(9) {
    left: 80%;
    animation-delay: 1s, 0s;
  }
  &:nth-of-type(10) {
    left: 90%;
    animation-delay: 3s, 1.5s;
  }
`
const generateRandomOpacityStyles = (count = 11) => {
  let styles = ''
  for (let i = 1; i <= count; i++) {
    const randomOpacity = (Math.random() * (0.8 - 0.2) + 0.2).toFixed(2)
    styles += `
      :nth-child(${i}) {
        opacity: ${randomOpacity};
      }
    `
  }
  return css`
    ${styles}
  `
}

export const XmasEffect: React.FC = memo(() => {
  return (
    <SnowflakesWrapper aria-hidden="true" $itemCount={11}>
      {Array.from({ length: 10 }).map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <Snowflake key={`SnowFlakeElements${index}`}>❄️</Snowflake>
      ))}
      <XmaxBg />
      <XmaxTree />
    </SnowflakesWrapper>
  )
})
