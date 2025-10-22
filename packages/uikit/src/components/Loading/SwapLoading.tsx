import { styled } from "styled-components";
import { ASSET_CDN } from "../../util/endpoints";
import { Box } from "../Box";

interface SwapLoadingProps {
  reverse?: boolean;
}

const SwapLoading = styled(Box)<SwapLoadingProps>`
  background-image: url(${ASSET_CDN}/web/swap-spinner.png);
  background-size: contain;
  -webkit-animation: spin 2s linear infinite ${({ reverse }) => (reverse ? "reverse" : "normal")};
  animation: spin 2s linear infinite ${({ reverse }) => (reverse ? "reverse" : "normal")};
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

SwapLoading.defaultProps = {
  width: "18px",
  height: "18px",
  reverse: false,
};

export default SwapLoading;
