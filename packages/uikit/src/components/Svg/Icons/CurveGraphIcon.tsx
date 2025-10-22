import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="0.5" y="16" width="2" height="4" rx="1" fill="currentColor" />
      <rect x="3.5" y="14" width="2" height="6" rx="1" fill="currentColor" />
      <rect x="6.5" y="11" width="2" height="9" rx="1" fill="currentColor" />
      <rect x="9.5" y="8" width="2" height="12" rx="1" fill="currentColor" />
      <rect opacity="0.6" x="12.5" y="8" width="2" height="12" rx="1" fill="currentColor" />
      <rect opacity="0.6" x="15.5" y="11" width="2" height="9" rx="1" fill="currentColor" />
      <rect opacity="0.6" x="18.5" y="14" width="2" height="6" rx="1" fill="currentColor" />
      <rect opacity="0.6" x="21.5" y="16" width="2" height="4" rx="1" fill="currentColor" />
    </Svg>
  );
};

export default Icon;
