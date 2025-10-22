import React from "react";
import Svg from "../Svg";
import { SvgProps } from "../types";

const Icon: React.FC<React.PropsWithChildren<SvgProps>> = (props) => {
  return (
    <Svg viewBox="0 0 33 32" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1707 17.0769L4.45508 4.71667H12.1505L18.1479 12.3561L24.5552 4.75107H28.7934L20.1971 14.9664L30.39 27.95H22.7175L16.2235 19.6884L9.29059 27.9271H5.02937L14.1707 17.0769ZM23.8358 25.6599L9.17368 7.0068H11.0314L25.675 25.6599H23.8358Z"
        fill="currentColor"
      />
    </Svg>
  );
};

export default Icon;
