import React, { forwardRef } from "react";
import { TokenPairLogoProps, variants } from "./types";
import { StyledChainLogo, StyledPrimaryLogo, StyledSecondaryLogo } from "./styles";
import Wrapper from "./Wrapper";

const TokenPairLogo = forwardRef<HTMLDivElement, React.PropsWithChildren<TokenPairLogoProps>>(
  (
    {
      primarySrcs,
      secondarySrcs,
      chainLogoSrcs,
      width,
      height,
      variant = variants.DEFAULT,
      primaryImageProps = {},
      secondaryImageProps = {},
      chainImageProps = {},
      ...props
    },
    ref
  ) => {
    const secondaryImageSize = Math.floor(width / 2);

    return (
      <Wrapper ref={ref} position="relative" width={width} height={height} {...props}>
        <StyledPrimaryLogo variant={variant} srcs={primarySrcs} width={width} height={height} {...primaryImageProps} />
        <StyledSecondaryLogo
          variant={variant}
          srcs={secondarySrcs}
          width={secondaryImageSize}
          height={secondaryImageSize}
          {...secondaryImageProps}
        />
        {chainLogoSrcs?.length ? (
          <StyledChainLogo
            variant={variant}
            srcs={chainLogoSrcs}
            width={Math.floor(width / 3)}
            height={Math.floor(height / 3)}
            {...chainImageProps}
          />
        ) : null}
      </Wrapper>
    );
  }
);

TokenPairLogo.displayName = "TokenPairLogo";

export default TokenPairLogo;
