import React from "react";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => (
  <svg height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_758_4913" maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="13">
      <rect width="12" height="12" transform="matrix(1 0 0 -1 0 12.5)" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_758_4913)">
      <path
        d="M1.90326 2.66019C1.65398 2.66019 1.47237 2.76644 1.35842 2.97894C1.24447 3.19144 1.25398 3.40096 1.38695 3.60748L5.49076 9.76402C5.6154 9.94445 5.78515 10.0347 6.00001 10.0347C6.21487 10.0347 6.38462 9.94445 6.50926 9.76402L10.6131 3.60748C10.746 3.40096 10.7555 3.19144 10.6416 2.97894C10.5276 2.76644 10.346 2.66019 10.0968 2.66019H1.90326Z"
        fill="#ED4B9E"
      />
    </g>
  </svg>
);

export default Icon;
