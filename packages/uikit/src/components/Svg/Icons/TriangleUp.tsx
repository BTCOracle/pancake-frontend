import React from "react";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => (
  <svg viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_758_4878" maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="13">
      <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_758_4878)">
      <path
        d="M1.90326 10.3398C1.65398 10.3398 1.47237 10.2336 1.35842 10.0211C1.24447 9.80856 1.25398 9.59904 1.38695 9.39252L5.49076 3.23598C5.6154 3.05555 5.78515 2.96533 6.00001 2.96533C6.21487 2.96533 6.38462 3.05555 6.50926 3.23598L10.6131 9.39252C10.746 9.59904 10.7555 9.80856 10.6416 10.0211C10.5276 10.2336 10.346 10.3398 10.0968 10.3398H1.90326Z"
        fill="#129E7D"
      />
    </g>
  </svg>
);

export default Icon;
