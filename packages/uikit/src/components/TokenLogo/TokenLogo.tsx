import { useState } from "react";
import styled from "styled-components";
import { DefaultTokenIcon } from "../Svg";

const BAD_SRCS: { [imageSrc: string]: true } = {};

export interface TokenLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  srcs: string[];
  imageRef?: React.RefObject<HTMLImageElement>;
}

const StyledImg = styled.img<{ $isLoaded: boolean }>`
  transition: opacity 0.3s ease;
  opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
`;

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
const TokenLogo: React.FC<React.PropsWithChildren<TokenLogoProps>> = ({ srcs, alt, imageRef, ...rest }) => {
  const [, refresh] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const src: string | undefined = srcs.find((s) => !BAD_SRCS[s]);
  if (src) {
    return (
      <StyledImg
        {...rest}
        ref={imageRef}
        alt={alt}
        src={src}
        $isLoaded={isLoaded}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          // eslint-disable-next-line no-param-reassign
          if (src) BAD_SRCS[src] = true;
          setIsLoaded(false);
          refresh((i) => i + 1);
        }}
      />
    );
  }

  return <DefaultTokenIcon color="disabled" {...rest} />;
};

export default TokenLogo;
