import styled, { keyframes } from "styled-components";
import Svg from "../Svg";
import { SvgProps } from "../types";

const SpinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const StyledSvg = styled(Svg)`
  animation: ${SpinAnimation} 1.5s linear infinite;
  transform-origin: center;
`;

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <StyledSvg width="40" height="40" viewBox="0 0 40 40" fill="none" {...props}>
      <g clip-path="url(#paint0_angular_6451_94138_clip_path)">
        <g transform="matrix(0.0166667 0 0 0.0166667 20.6012 20)">
          <foreignObject x="-1240" y="-1240" width="2480" height="2480">
            <div
              style={{
                background: `conic-gradient(from 90deg,rgba(31, 199, 212, 0) 0deg,rgba(31, 199, 212, 0) 90deg,${
                  props.fill || "#1fc7d4"
                } 360deg)`,
                height: "100%",
                width: "100%",
                opacity: 1,
              }}
            />
          </foreignObject>
        </g>
      </g>
      <path
        d="M37.2682 20.0002C37.2682 21.8412 35.7758 23.3336 33.9349 23.3336C32.0939 23.3336 30.6016 21.8412 30.6016 20.0002C33.9349 20.0002 32.0939 20.0001 33.9349 20.0001C35.7758 20.0001 33.9349 19.9999 37.2682 20.0002Z"
        fill={props.fill || "#1FC7D4"}
      />
      <defs>
        <clipPath id="paint0_angular_6451_94138_clip_path">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M20.6012 30C26.1241 30 30.6012 25.5229 30.6012 20C30.6012 14.4772 26.1241 10 20.6012 10C15.0784 10 10.6012 14.4772 10.6012 20C10.6012 25.5229 15.0784 30 20.6012 30ZM20.6012 36.6667C29.806 36.6667 37.2679 29.2048 37.2679 20C37.2679 10.7953 29.806 3.33337 20.6012 3.33337C11.3965 3.33337 3.93457 10.7953 3.93457 20C3.93457 29.2048 11.3965 36.6667 20.6012 36.6667Z"
          />
        </clipPath>
      </defs>
    </StyledSvg>
  );
};

export default Icon;
