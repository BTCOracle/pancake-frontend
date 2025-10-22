import { Box, BoxProps, HelpIcon } from "@pancakeswap/uikit";
import Image from "next/image";
import { CSSProperties, memo, useState } from "react";
import { ASSET_CDN } from "../../utils/endpoints";

export const ChainLogo = memo(
  ({
    chainId,
    width = 24,
    height = 24,
    imageStyles,
    src,
    ...props
  }: { chainId?: number; width?: number; height?: number; imageStyles?: CSSProperties; src?: string } & BoxProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    const icon = chainId ? (
      <Image
        alt={`chain-${chainId}`}
        style={{
          maxHeight: `${height}px`,
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.2s ease",
          ...imageStyles,
        }}
        src={src ?? `${ASSET_CDN}/web/chains/square/${chainId}.svg`}
        width={width}
        height={height}
        unoptimized
        onLoad={() => setImageLoaded(true)}
      />
    ) : (
      <HelpIcon width={width} height={height} />
    );
    return <Box {...props}>{icon}</Box>;
  }
);
