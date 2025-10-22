import { bunnyHeadMain, bunnyHeadMax } from '@pancakeswap/uikit/components/Slider/styles'
import Slider, { SliderProps } from 'rc-slider'
import 'rc-slider/assets/index.css'
import styled from 'styled-components'

type BinSliderProps = SliderProps

const StyledSlider = styled(Slider)`
  .rc-slider-rail {
    background-color: ${({ theme, disabled }) => theme.colors[disabled ? 'textDisabled' : 'inputSecondary']};
    height: 2px;
    position: absolute;
    top: 18px;
    width: 100%;
  }

  .rc-slider-track {
    background-color: ${({ theme }) => theme.colors.primary};
    filter: ${({ disabled }) => (disabled ? 'grayscale(100%)' : 'none')};
    height: 10px;
    position: absolute;
    top: 18px;
  }

  .rc-slider-handle {
    -webkit-appearance: none;
    background-color: transparent;
    box-shadow: none;
    border: 0;
    cursor: pointer;
    width: 24px;
    height: 32px;
    filter: none;
    transform: translate(-2px, -2px);
    transition: 200ms transform;
    &:hover {
      transform: scale(1.1) translate(-3px, -3px);
    }
  }

  .rc-slider-handle-1 {
    background-image: url(${bunnyHeadMax});
  }

  .rc-slider-handle-2 {
    background-image: url(${bunnyHeadMain});
  }
`

export const BinSlider: React.FC<BinSliderProps> = (props) => {
  return <StyledSlider range {...props} />
}
