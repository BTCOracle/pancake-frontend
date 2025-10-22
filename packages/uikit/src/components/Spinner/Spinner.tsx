import React from "react";
import { ASSET_CDN } from "../../util/endpoints";
import { Box } from "../Box";
import { Image } from "../Image";
import { SpinnerProps } from "./types";

const Spinner: React.FC<React.PropsWithChildren<SpinnerProps>> = ({ size = 128 }) => {
  return (
    <Box width={size} height={size * 1.197} position="relative">
      <Image
        width={size}
        height={size * 1.197}
        src={`${ASSET_CDN}/web/pancake-3d-spinner-v2.gif`}
        alt="pancake-3d-spinner"
      />
    </Box>
  );
};

export default Spinner;
